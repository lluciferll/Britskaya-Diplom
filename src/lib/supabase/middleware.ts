import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isPreviewRequestCookie, PREVIEW_COOKIE } from "@/lib/previewMode";
import { supabaseCookieOptions } from "@/lib/supabase/cookieOptions";

/** Маршруты Supabase OAuth / экран ошибки — должны быть доступны без JWT. */
function isPublicAuthRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/demo" ||
    pathname === "/obzor" ||
    pathname === "/api/demo-login" ||
    pathname === "/api/preview-enter" ||
    pathname === "/api/preview-exit" ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/auth-code-error")
  );
}

/** Чтобы после redirect JWT-куки не потерялись — переносим Set-Cookie из ответа Supabase. */
function redirectWithSession(request: NextRequest, supabaseResponse: NextResponse, pathname: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.hash = "";
  return NextResponse.redirect(redirectUrl, {
    headers: supabaseResponse.headers,
  });
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.trim() || !anon?.trim()) {
    return supabaseResponse;
  }

  // Перегрузка get/set/remove — стабильно проходит проверку типов в @supabase/ssr 0.8.x
  const supabase = createServerClient(url, anon, {
    cookieOptions: supabaseCookieOptions(),
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value ?? null;
      },
      set(name: string, value: string, options: CookieOptions) {
        // У RequestCookies в middleware только (name, value), без options.
        request.cookies.set(name, value);
        supabaseResponse = NextResponse.next({ request });
        supabaseResponse.cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set(name, "");
        supabaseResponse = NextResponse.next({ request });
        supabaseResponse.cookies.set(name, "", { ...options, maxAge: 0 });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const previewBypass = isPreviewRequestCookie(request.cookies.get(PREVIEW_COOKIE)?.value);

  if (previewBypass) {
    if (pathname === "/login" || pathname === "/demo") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.hash = "";
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  if (!user && !isPublicAuthRoute(pathname)) {
    return redirectWithSession(request, supabaseResponse, "/login");
  }

  if (user && pathname === "/login") {
    return redirectWithSession(request, supabaseResponse, "/campaigns");
  }

  return supabaseResponse;
}
