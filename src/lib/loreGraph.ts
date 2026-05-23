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

function pushEdge(edges: LoreGraphEdge[], edge: LoreGraphEdge, uniq: Map<string, LoreGraphEdge>) {
  const k = `${edge.from}→${edge.to}`;
  if (uniq.has(k)) return;
  uniq.set(k, edge);
  edges.push(edge);
}

function linkEntityByName(
  fromUid: string,
  text: string,
  campaign: Campaign,
  edges: LoreGraphEdge[],
  ids: Set<string>,
  uniq: Map<string, LoreGraphEdge>,
) {
  const hay = normalizeWikiKey(text);
  if (!hay) return;

  const tryLink = (kind: LoreGraphNode["kind"], id: string, name: string, label: string) => {
    const key = normalizeWikiKey(name);
    if (!key || key.length < 3 || !hay.includes(key)) return;
    const to = uid(kind, id);
    if (!ids.has(to) || fromUid === to) return;
    pushEdge(edges, { from: fromUid, to, label, dashed: true }, uniq);
  };

  for (const ch of campaign.characters ?? []) tryLink("character", ch.id, ch.name, "упоминание");
  for (const l of campaign.locations ?? []) tryLink("location", l.id, l.name, "упоминание");
  for (const f of campaign.factions ?? []) tryLink("faction", f.id, f.name, "упоминание");
  for (const q of campaign.quests ?? []) tryLink("quest", q.id, q.title, "упоминание");
  for (const w of campaign.wikiArticles ?? []) tryLink("wiki", w.slug, w.title, "упоминание");
}

/** Граф связей кампании: вики, сущности, иерархия локаций, ручные рёбра. */
export function buildLoreGraph(campaign: Campaign): { nodes: LoreGraphNode[]; edges: LoreGraphEdge[] } {
  const wiki = campaign.wikiArticles ?? [];
  const nodes: LoreGraphNode[] = [];
  const ids = new Set<string>();

  const add = (n: LoreGraphNode) => {
    if (ids.has(n.uid)) return;
    ids.add(n.uid);
    nodes.push(n);
  };

  for (const w of wiki) add({ uid: uid("wiki", w.slug), kind: "wiki", label: w.title });
  for (const ch of campaign.characters ?? []) add({ uid: uid("character", ch.id), kind: "character", label: ch.name });
  for (const l of campaign.locations ?? []) add({ uid: uid("location", l.id), kind: "location", label: l.name });
  for (const f of campaign.factions ?? []) add({ uid: uid("faction", f.id), kind: "faction", label: f.name });
  for (const q of campaign.quests ?? []) add({ uid: uid("quest", q.id), kind: "quest", label: q.title });

  const index = buildWikiArticleIndex(wiki.map((w) => ({ slug: w.slug, title: w.title })));
  const edges: LoreGraphEdge[] = [];
  const uniq = new Map<string, LoreGraphEdge>();

  const linkWiki = (fromSlug: string, targetTitleOrSlug: string) => {
    const key = normalizeWikiKey(targetTitleOrSlug);
    const hit = index.get(key);
    if (!hit) return;
    pushEdge(
      edges,
      { from: uid("wiki", fromSlug), to: uid("wiki", hit.slug), label: "[[]]", dashed: false },
      uniq,
    );
  };

  const linkEntityFallback = (fromSlug: string, name: string) => {
    const key = normalizeWikiKey(name);
    const ch = (campaign.characters ?? []).find((x) => normalizeWikiKey(x.name) === key);
    if (ch) pushEdge(edges, { from: uid("wiki", fromSlug), to: uid("character", ch.id), label: "имя в тексте", dashed: true }, uniq);
    const l = (campaign.locations ?? []).find((x) => normalizeWikiKey(x.name) === key);
    if (l) pushEdge(edges, { from: uid("wiki", fromSlug), to: uid("location", l.id), label: "имя в тексте", dashed: true }, uniq);
    const f = (campaign.factions ?? []).find((x) => normalizeWikiKey(x.name) === key);
    if (f) pushEdge(edges, { from: uid("wiki", fromSlug), to: uid("faction", f.id), label: "имя в тексте", dashed: true }, uniq);
    const q = (campaign.quests ?? []).find((x) => normalizeWikiKey(x.title) === key);
    if (q) pushEdge(edges, { from: uid("wiki", fromSlug), to: uid("quest", q.id), label: "имя в тексте", dashed: true }, uniq);
  };

  for (const w of wiki) {
    const segments = parseWikiBody(w.body, index);
    for (const s of segments) {
      if (s.kind !== "wiki") continue;
      if (s.exists) linkWiki(w.slug, s.title);
      else linkEntityFallback(w.slug, s.title);
    }
    linkEntityByName(uid("wiki", w.slug), w.body, campaign, edges, ids, uniq);
  }

  for (const ch of campaign.characters ?? []) {
    const text = [ch.summary, ch.tags, ch.personality, ch.secret, ch.motivation, ch.statBlock?.description]
      .filter(Boolean)
      .join("\n");
    if (text) linkEntityByName(uid("character", ch.id), text, campaign, edges, ids, uniq);
  }
  for (const l of campaign.locations ?? []) {
    if (l.notes) linkEntityByName(uid("location", l.id), l.notes, campaign, edges, ids, uniq);
    if (l.parentId && ids.has(uid("location", l.parentId))) {
      pushEdge(
        edges,
        { from: uid("location", l.id), to: uid("location", l.parentId), label: "входит в", dashed: false },
        uniq,
      );
    }
  }
  for (const f of campaign.factions ?? []) {
    if (f.notes) linkEntityByName(uid("faction", f.id), f.notes, campaign, edges, ids, uniq);
  }
  for (const q of campaign.quests ?? []) {
    if (q.notes) linkEntityByName(uid("quest", q.id), q.notes, campaign, edges, ids, uniq);
  }

  for (const edge of campaign.loreGraphExtras ?? []) {
    const fromUid = uid(edge.fromKind, edge.fromId);
    const toUid = uid(edge.toKind, edge.toId);
    if (ids.has(fromUid) && ids.has(toUid)) {
      pushEdge(edges, { from: fromUid, to: toUid, label: edge.label || "связь", dashed: false }, uniq);
    }
  }

  return { nodes, edges };
}
