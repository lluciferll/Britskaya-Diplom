/** Нормализация для резолва [[Подписей]] */
export function normalizeWikiKey(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

export function slugifyWikiTitle(raw: string): string {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || `article-${Math.random().toString(36).slice(2, 9)}`;
}

export type WikiIndexEntry = { slug: string; title: string };

/** Индекс: ключ — нормализованное имя или slug */
export function buildWikiArticleIndex(entries: Iterable<{ slug: string; title: string }>): Map<string, WikiIndexEntry> {
  const map = new Map<string, WikiIndexEntry>();
  for (const it of entries) {
    map.set(normalizeWikiKey(it.title), { slug: it.slug, title: it.title });
    map.set(normalizeWikiKey(it.slug), { slug: it.slug, title: it.title });
  }
  return map;
}

/** Доп. совпадения по сущностям кампании (имена локаций, НПС, квесты) */
export function buildEntityWikiOverlay(
  data: {
    characters: Iterable<{ id: string; name: string; kind?: "npc" | "pc" }>;
    locations: Iterable<{ id: string; name: string }>;
    factions: Iterable<{ id: string; name: string }>;
    quests: Iterable<{ id: string; title: string }>;
  },
  wikiIndex: Map<string, WikiIndexEntry>,
): Map<string, { kind: string; label: string; href: string }> {
  const auto = new Map<string, { kind: string; label: string; href: string }>();
  const put = (name: string, kind: string, href: string) => {
    const k = normalizeWikiKey(name);
    if (!k || wikiIndex.has(k)) return;
    auto.set(k, { kind, label: name, href });
  };
  for (const x of data.characters) put(x.name, x.kind === "pc" ? "Персонаж" : "NPC", `#char-${x.id}`);
  for (const x of data.locations) put(x.name, "Локация", `#loc-${x.id}`);
  for (const x of data.factions) put(x.name, "Фракция", `#fac-${x.id}`);
  for (const x of data.quests) put(x.title, "Квест", `#quest-${x.id}`);
  return auto;
}

export type WikiBodySegment =
  | { kind: "text"; value: string }
  | { kind: "wiki"; title: string; slug: string; exists: boolean };

const LINK_RE = /\[\[([^[\]]+)\]\]/g;

export function parseWikiBody(markup: string, articleIndex: Map<string, WikiIndexEntry>): WikiBodySegment[] {
  const segments: WikiBodySegment[] = [];
  let last = 0;
  for (const m of markup.matchAll(LINK_RE)) {
    const i = m.index ?? 0;
    if (i > last) segments.push({ kind: "text", value: markup.slice(last, i) });
    const inner = (m[1] ?? "").trim();
    const key = normalizeWikiKey(inner);
    const hit = articleIndex.get(key);
    if (hit) {
      segments.push({ kind: "wiki", title: hit.title, slug: hit.slug, exists: true });
    } else {
      segments.push({ kind: "wiki", title: inner, slug: slugifyWikiTitle(inner), exists: false });
    }
    last = i + m[0].length;
  }
  if (last < markup.length) segments.push({ kind: "text", value: markup.slice(last) });
  return segments;
}

/** Простые кандидаты на подсветку имён без [[ ]] если включено пользователем */
export function autoLinkSegments(
  text: string,
  names: Iterable<string>,
  articleIndex: Map<string, WikiIndexEntry>,
): WikiBodySegment[] {
  let list = Array.from(new Set([...names].map((n) => n.trim()).filter(Boolean))).sort((a, b) => b.length - a.length);
  if (list.length === 0) return [{ kind: "text", value: text }];
  const escaped = list.map((n) =>
    n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"),
  );
  const re = new RegExp(`(?:${escaped.join("|")})`, "giu");
  const segments: WikiBodySegment[] = [];
  let idx = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > idx) segments.push({ kind: "text", value: text.slice(idx, m.index) });
    const matched = m[0];
    const key = normalizeWikiKey(matched);
    const wiki = articleIndex.get(key);
    if (wiki) segments.push({ kind: "wiki", title: wiki.title, slug: wiki.slug, exists: true });
    else segments.push({ kind: "text", value: matched });
    idx = m.index + matched.length;
  }
  if (idx < text.length) segments.push({ kind: "text", value: text.slice(idx) });
  return segments;
}
