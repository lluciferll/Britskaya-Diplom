import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Одни и те же правила для browser client, middleware и route handlers —
 * иначе на проде cookie сессии могут «не склеиться» между клиентом и Edge,
 * и после навигации сессия пропадает (в шапке снова «Вход»).
 */
export function supabaseCookieOptions(): CookieOptionsWithName {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const prodHttpsSite = siteUrl.startsWith("https://");
  const onVercel = process.env.VERCEL === "1";
  return {
    path: "/",
    sameSite: "lax",
    secure: prodHttpsSite || onVercel,
  };
}
