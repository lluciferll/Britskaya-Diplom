import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { getDemoCredentials, isDemoAccessEnabled } from "@/lib/demoAccess";
import { supabaseCookieOptions } from "@/lib/supabase/cookieOptions";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Одним GET входит в демо-аккаунт и редиректит в приложение.
 * Для проверяющих и нейросетей с поддержкой cookie/редиректов.
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  if (!isDemoAccessEnabled()) {
    return NextResponse.json({ error: "Демо-вход отключён" }, { status: 404 });
  }

  const creds = getDemoCredentials();
  if (!creds) {
    return NextResponse.json({ error: "Демо-учётные данные не заданы" }, { status: 500 });
  }

  const nextSearch = request.nextUrl.searchParams.get("next");
  const nextPath = nextSearch && nextSearch.startsWith("/") ? nextSearch : "/campaigns";
  const redirectUrl = new URL(nextPath, origin);
  const response = NextResponse.redirect(redirectUrl);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.trim() || !anon?.trim()) {
    return NextResponse.json({ error: "Supabase не настроен" }, { status: 500 });
  }

  const supabase = createServerClient(url, anon, {
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

  const { error } = await supabase.auth.signInWithPassword({
    email: creds.email,
    password: creds.password,
  });

  if (error) {
    const errUrl = new URL("/demo", origin);
    errUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(errUrl);
  }

  return response;
}
