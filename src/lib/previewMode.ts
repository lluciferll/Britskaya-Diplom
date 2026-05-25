/** Режим предпросмотра: полный UI без Supabase Auth (для диплома и нейросетей с браузером). */

export const PREVIEW_COOKIE = "mf-preview";
export const PREVIEW_COOKIE_VALUE = "1";
export const PREVIEW_SESSION_SEEDED = "mf-preview-seeded";

export const PREVIEW_ENTER_PATH = "/api/preview-enter";
export const PREVIEW_EXIT_PATH = "/api/preview-exit";

export function isPreviewRequestCookie(value: string | undefined | null): boolean {
  return value === PREVIEW_COOKIE_VALUE;
}

export function isPreviewModeClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim() === `${PREVIEW_COOKIE}=${PREVIEW_COOKIE_VALUE}`);
}

export function previewCookieOptions(): {
  path: string;
  httpOnly: boolean;
  sameSite: "lax";
  maxAge: number;
  secure: boolean;
} {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const secure = siteUrl.startsWith("https://") || process.env.NODE_ENV === "production";
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
    secure,
  };
}
