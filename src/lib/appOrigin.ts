/** Публичный origin без завершающего `/` — для `emailRedirectTo` и ссылок Supabase Auth. */
export function getPublicAppOrigin(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (env) return env;

  if (typeof window === "undefined") return "";

  const { hostname, port, protocol, host } = window.location;

  // Лог контейнера «Network http://0.0.0.0:3000» — браузер открывает 0.0.0.0:3000, а снаружи Docker у нас 3050.
  if (hostname === "0.0.0.0") {
    const p = port === "3000" ? "3050" : port || "3050";
    return `http://localhost:${p}`;
  }

  return `${protocol}//${host}`;
}
