import { publicUrl } from "@/lib/appOrigin";
import { PREVIEW_COOKIE, previewCookieOptions } from "@/lib/previewMode";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(publicUrl(request, "/login"));
  const opts = previewCookieOptions();
  response.cookies.set(PREVIEW_COOKIE, "", { ...opts, maxAge: 0 });
  return response;
}
