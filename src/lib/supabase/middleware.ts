import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/** Маршруты Supabase OAuth / экран ошибки — должны быть доступны без JWT. */
function isPublicAuthRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/auth-code-error")
  );
}

/** Чтобы после refresh JWT в middleware куки не потерялись при redirect. */
function copyCookiesTo(from: NextResponse, to: NextResponse) {
  for (const c of from.cookies.getAll()) {
    to.cookies.set(c.name, c.value);
  }
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

  if (!user && !isPublicAuthRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.hash = "";
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyCookiesTo(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (user && pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.hash = "";
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyCookiesTo(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  return supabaseResponse;
}
