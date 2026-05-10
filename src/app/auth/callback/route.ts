import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { supabaseCookieOptions } from "@/lib/supabase/cookieOptions";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const nextSearch = request.nextUrl.searchParams.get("next");
  const nextPath = nextSearch && nextSearch.startsWith("/") ? nextSearch : "/";

  const redirectUrl = new URL(nextPath, origin);
  const response = NextResponse.redirect(redirectUrl);

  // Route handlers: deprecated get/set/remove overload чётко выбирается TypeScript’ом
  // (getAll/setAll дают конфликт перегрузок в этой версии @supabase/ssr).
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookieOptions: supabaseCookieOptions(),
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value ?? null;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set(name, "", { ...options, maxAge: 0 });
      },
    },
  });

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const errUrl = new URL("/auth/auth-code-error", origin);
    errUrl.searchParams.set("reason", error.message);
    return NextResponse.redirect(errUrl);
  }

  return response;
}
