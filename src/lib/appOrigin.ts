import type { NextRequest } from "next/server";

function isBadPublicHost(host: string): boolean {
  const h = host.toLowerCase();
  return h.startsWith("0.0.0.0") || h.startsWith("127.0.0.1") || h === "localhost";
}

/** Публичный origin без завершающего `/` — для `emailRedirectTo` и ссылок Supabase Auth. */
export function getPublicAppOrigin(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (env && !env.includes("0.0.0.0")) return env;

  if (typeof window === "undefined") return env ?? "";

  const { hostname, port, protocol, host } = window.location;

  // Лог контейнера «Network http://0.0.0.0:3000» — браузер открывает 0.0.0.0:3000, а снаружи Docker у нас 3050.
  if (hostname === "0.0.0.0") {
    const p = port === "3000" ? "3050" : port || "3050";
    return `http://localhost:${p}`;
  }

  return `${protocol}//${host}`;
}

/**
 * Публичный URL для редиректов на сервере (Amvera/Docker за прокси).
 * request.nextUrl.origin часто = https://0.0.0.0:3000 — браузер не откроет.
 */
export function getRequestPublicOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured && !configured.includes("0.0.0.0")) {
    return configured;
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https";
  if (forwardedHost && !isBadPublicHost(forwardedHost)) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = request.headers.get("host")?.trim();
  if (host && !isBadPublicHost(host.split(":")[0] ?? host)) {
    const proto = request.nextUrl.protocol.replace(":", "") || forwardedProto;
    return `${proto}://${host}`;
  }

  const origin = request.nextUrl.origin;
  if (!origin.includes("0.0.0.0")) {
    return origin;
  }

  return configured || "http://localhost:3050";
}

export function publicUrl(request: NextRequest, pathname: string): URL {
  return new URL(pathname, getRequestPublicOrigin(request));
}
