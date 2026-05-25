import { PREVIEW_COOKIE, previewCookieOptions } from "@/lib/previewMode";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const response = NextResponse.redirect(new URL("/login", origin));
  const opts = previewCookieOptions();
  response.cookies.set(PREVIEW_COOKIE, "", { ...opts, maxAge: 0 });
  return response;
}
