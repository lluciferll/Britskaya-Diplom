import type { Crumb } from "@/components/AppShell";

/** Безопасный внутренний путь для возврата (без open redirect). */
export function sanitizeReturnPath(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const path = raw.split("?")[0]?.trim() ?? "";
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

export function linkWithFrom(target: string, from: string, fromLabel?: string): string {
  const safeFrom = sanitizeReturnPath(from);
  if (!safeFrom) return target;
  const params = new URLSearchParams();
  params.set("from", safeFrom);
  if (fromLabel?.trim()) params.set("fromLabel", fromLabel.trim());
  const sep = target.includes("?") ? "&" : "?";
  return `${target}${sep}${params.toString()}`;
}

const TOOL_PAGES: Record<string, string> = {
  "/tools/dice": "Кубики",
  "/tools/encounter": "Встреча по XP",
  "/tools/loot": "Добыча",
  "/tools/encounter-builder": "Столкновения",
  "/reference": "Шпаргалка мастера",
  "/character-creator": "Конструктор персонажа",
  "/atlas": "Атлас Faerûn",
};

const GENERATOR_PAGES: Record<string, string> = {
  "/generators/npc": "Генератор NPC",
  "/generators/events": "Случайные события",
  "/generators/shop": "Лавка / рынок",
  "/generators/emergency": "Emergency",
};

function crumbsHome(): Crumb {
  return { href: "/", label: "Главная" };
}

function crumbsCampaigns(): Crumb {
  return { href: "/campaigns", label: "Кампании" };
}

function crumbsToolsHub(): Crumb {
  return { href: "/tools", label: "За столом" };
}

function crumbsGeneratorsHub(): Crumb {
  return { href: "/generators", label: "Генераторы" };
}

function crumbsLore(): Crumb {
  return { href: "/lore", label: "Справка" };
}

function campaignIdFromPath(path: string): string | null {
  const m = path.match(/^\/campaigns\/([^/]+)/);
  return m?.[1] ?? null;
}

function sessionOrMapCampaignId(path: string): string | null {
  const m = path.match(/^\/(?:session|maps)\/([^/]+)/);
  return m?.[1] ?? null;
}

function dedupeCrumbs(crumbs: Crumb[]): Crumb[] {
  const seen = new Set<string>();
  const out: Crumb[] = [];
  for (const c of crumbs) {
    if (seen.has(c.href)) continue;
    seen.add(c.href);
    out.push(c);
  }
  return out;
}

function buildFromPrefix(
  from: string,
  opts?: {
    fromLabel?: string | null;
    resolveCampaignTitle?: (campaignId: string) => string | undefined;
  },
): Crumb[] {
  const crumbs: Crumb[] = [crumbsHome()];

  if (from === "/campaigns" || from.startsWith("/campaigns/")) {
    crumbs.push(crumbsCampaigns());
    const cid = campaignIdFromPath(from);
    if (cid && from !== "/campaigns") {
      const title = opts?.fromLabel?.trim() || opts?.resolveCampaignTitle?.(cid) || "Кампания";
      crumbs.push({ href: from, label: title });
    }
    return crumbs;
  }

  if (from === "/tools" || from.startsWith("/tools/") || from === "/reference" || from === "/character-creator" || from === "/atlas") {
    crumbs.push(crumbsToolsHub());
    if (from !== "/tools" && TOOL_PAGES[from]) {
      crumbs.push({ href: from, label: TOOL_PAGES[from] });
    }
    return crumbs;
  }

  if (from === "/generators" || from.startsWith("/generators/")) {
    crumbs.push(crumbsGeneratorsHub());
    if (from !== "/generators" && GENERATOR_PAGES[from]) {
      crumbs.push({ href: from, label: GENERATOR_PAGES[from] });
    }
    return crumbs;
  }

  if (from === "/lore") {
    crumbs.push(crumbsLore());
    return crumbs;
  }

  if (from === "/") return [crumbsHome()];

  if (opts?.fromLabel?.trim()) {
    crumbs.push({ href: from, label: opts.fromLabel.trim() });
  }

  return crumbs;
}

function isToolsPath(path: string): boolean {
  return path === "/tools" || path.startsWith("/tools/") || path === "/reference" || path === "/character-creator" || path === "/atlas";
}

function isGeneratorsPath(path: string): boolean {
  return path === "/generators" || path.startsWith("/generators/");
}

/**
 * Хлебные крошки: предки текущей страницы (сама страница — в заголовке h1).
 */
export function resolveBreadcrumbs(
  pathname: string,
  opts?: {
    from?: string | null;
    fromLabel?: string | null;
    resolveCampaignTitle?: (campaignId: string) => string | undefined;
  },
): Crumb[] {
  const path = pathname.split("?")[0] ?? pathname;
  const from = sanitizeReturnPath(opts?.from ?? null);

  if (from && from !== path) {
    const prefix = buildFromPrefix(from, opts);
    const merged = [...prefix];
    if (isToolsPath(path) && !merged.some((c) => c.href === "/tools")) {
      merged.push(crumbsToolsHub());
    }
    if (isGeneratorsPath(path) && !merged.some((c) => c.href === "/generators")) {
      merged.push(crumbsGeneratorsHub());
    }
    return dedupeCrumbs(merged);
  }

  if (path === "/" || path === "") return [];

  if (path === "/campaigns") return [crumbsHome(), crumbsCampaigns()];

  const campId = campaignIdFromPath(path);
  if (campId && path.startsWith("/campaigns/")) {
    const title = opts?.resolveCampaignTitle?.(campId) || "Кампания";
    return [crumbsHome(), crumbsCampaigns(), { href: path, label: title }];
  }

  const sessId = sessionOrMapCampaignId(path);
  if (sessId && path.startsWith("/session/")) {
    const title = opts?.resolveCampaignTitle?.(sessId) || "Кампания";
    return [
      crumbsHome(),
      crumbsCampaigns(),
      { href: `/campaigns/${sessId}`, label: title },
      { href: path, label: "Сессия" },
    ];
  }
  if (sessId && path.startsWith("/maps/")) {
    const title = opts?.resolveCampaignTitle?.(sessId) || "Кампания";
    return [
      crumbsHome(),
      crumbsCampaigns(),
      { href: `/campaigns/${sessId}`, label: title },
      { href: path, label: "Карта" },
    ];
  }

  if (path === "/lore") return [crumbsHome(), crumbsLore()];
  if (path === "/tools") return [crumbsHome(), crumbsToolsHub()];
  if (isToolsPath(path)) return [crumbsHome(), crumbsToolsHub()];
  if (path === "/generators") return [crumbsHome(), crumbsGeneratorsHub()];
  if (isGeneratorsPath(path)) return [crumbsHome(), crumbsGeneratorsHub()];
  if (path === "/login") return [crumbsHome()];

  return [crumbsHome()];
}

export function parentFromBreadcrumbs(crumbs: Crumb[]): Crumb | null {
  if (crumbs.length === 0) return null;
  return crumbs[crumbs.length - 1] ?? null;
}
