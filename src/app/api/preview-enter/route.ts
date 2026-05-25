import { publicUrl } from "@/lib/appOrigin";
import { PREVIEW_COOKIE, PREVIEW_COOKIE_VALUE, previewCookieOptions } from "@/lib/previewMode";
import { type NextRequest, NextResponse } from "next/server";

/** Включить предпросмотр без Supabase и открыть приложение. */
export async function GET(request: NextRequest) {
  const nextSearch = request.nextUrl.searchParams.get("next");
  const nextPath = nextSearch && nextSearch.startsWith("/") ? nextSearch : "/";
  const response = NextResponse.redirect(publicUrl(request, nextPath));
  response.cookies.set(PREVIEW_COOKIE, PREVIEW_COOKIE_VALUE, previewCookieOptions());
  return response;
}
