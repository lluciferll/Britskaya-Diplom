import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { publicUrl } from "@/lib/appOrigin";
import { supabaseCookieOptions } from "@/lib/supabase/cookieOptions";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const nextSearch = request.nextUrl.searchParams.get("next");
  const nextPath = nextSearch && nextSearch.startsWith("/") ? nextSearch : "/campaigns";

  const response = NextResponse.redirect(publicUrl(request, nextPath));

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
    return NextResponse.redirect(publicUrl(request, "/auth/auth-code-error"));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const errUrl = publicUrl(request, "/auth/auth-code-error");
    errUrl.searchParams.set("reason", error.message);
    return NextResponse.redirect(errUrl);
  }

  return response;
}
