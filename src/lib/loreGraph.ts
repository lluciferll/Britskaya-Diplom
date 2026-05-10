import type { Campaign } from "@/domain/types";
import { buildWikiArticleIndex, normalizeWikiKey, parseWikiBody } from "@/lib/wikiLinking";

export type LoreGraphNode = {
  uid: string;
  kind: "wiki" | "character" | "location" | "faction" | "quest";
  label: string;
};

export type LoreGraphEdge = { from: string; to: string; label?: string; dashed?: boolean };

function uid(kind: LoreGraphNode["kind"], raw: string) {
  return `${kind}:${raw}`;
}

/** Граф связей кампании: статьи + сущности + ручные рёбра + [[wiki]] парсинг */
export function buildLoreGraph(campaign: Campaign): { nodes: LoreGraphNode[]; edges: LoreGraphEdge[] } {
  const wiki = campaign.wikiArticles ?? [];
  const nodes: LoreGraphNode[] = [];
  const ids = new Set<string>();

  const add = (n: LoreGraphNode) => {
    if (ids.has(n.uid)) return;
    ids.add(n.uid);
    nodes.push(n);
  };

  for (const w of wiki) {
    add({ uid: uid("wiki", w.slug), kind: "wiki", label: w.title });
  }
  for (const ch of campaign.characters ?? []) {
    add({ uid: uid("character", ch.id), kind: "character", label: ch.name });
  }
  for (const l of campaign.locations ?? []) {
    add({ uid: uid("location", l.id), kind: "location", label: l.name });
  }
  for (const f of campaign.factions ?? []) {
    add({ uid: uid("faction", f.id), kind: "faction", label: f.name });
  }
  for (const q of campaign.quests ?? []) {
    add({ uid: uid("quest", q.id), kind: "quest", label: q.title });
  }

  const index = buildWikiArticleIndex(wiki.map((w) => ({ slug: w.slug, title: w.title })));

  const edges: LoreGraphEdge[] = [];

  const linkWiki = (fromSlug: string, targetTitleOrSlug: string) => {
    const key = normalizeWikiKey(targetTitleOrSlug);
    const hit = index.get(key);
    if (!hit) return;
    edges.push({
      from: uid("wiki", fromSlug),
      to: uid("wiki", hit.slug),
      label: "[[]]",
      dashed: false,
    });
  };

  const linkEntityFallback = (fromSlug: string, name: string) => {
    const key = normalizeWikiKey(name);
    const ch = (campaign.characters ?? []).find((x) => normalizeWikiKey(x.name) === key);
    if (ch) edges.push({ from: uid("wiki", fromSlug), to: uid("character", ch.id), label: "имя в тексте", dashed: true });
    const l = (campaign.locations ?? []).find((x) => normalizeWikiKey(x.name) === key);
    if (l) edges.push({ from: uid("wiki", fromSlug), to: uid("location", l.id), label: "имя в тексте", dashed: true });
    const f = (campaign.factions ?? []).find((x) => normalizeWikiKey(x.name) === key);
    if (f) edges.push({ from: uid("wiki", fromSlug), to: uid("faction", f.id), label: "имя в тексте", dashed: true });
    const q = (campaign.quests ?? []).find((x) => normalizeWikiKey(x.title) === key);
    if (q) edges.push({ from: uid("wiki", fromSlug), to: uid("quest", q.id), label: "имя в тексте", dashed: true });
  };

  for (const w of wiki) {
    const segments = parseWikiBody(w.body, index);
    for (const s of segments) {
      if (s.kind !== "wiki") continue;
      if (s.exists) linkWiki(w.slug, s.title);
      else linkEntityFallback(w.slug, s.title);
    }
  }

  for (const edge of campaign.loreGraphExtras ?? []) {
    const fromUid = uid(edge.fromKind, edge.fromId);
    const toUid = uid(edge.toKind, edge.toId);
    if (ids.has(fromUid) && ids.has(toUid)) {
      edges.push({ from: fromUid, to: toUid, label: edge.label || "мастер" });
    }
  }

  const uniq = new Map<string, LoreGraphEdge>();
  for (const e of edges) {
    const k = `${e.from}→${e.to}`;
    if (!uniq.has(k)) uniq.set(k, e);
  }

  return { nodes, edges: Array.from(uniq.values()) };
}
