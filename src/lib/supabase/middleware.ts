import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

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

  await supabase.auth.getUser();

  return supabaseResponse;
}
