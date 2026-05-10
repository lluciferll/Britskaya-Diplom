import type { MonsterStatblock, WikiArticle } from "@/domain/types";
import { slugifyWikiTitle } from "@/lib/wikiLinking";
import type { SrdMonsterCatalogEntry } from "@/data/srd/types";
import { getSrdMonsterByKey } from "@/data/srd/monsters";
import type { SrdDeityPreset } from "@/data/srd/types";

const ATTRIBUTION_NOTE =
  "Mechanical synopsis derived from Dungeons & Dragons 5th Edition SRD (Open Game License). Not all Monster Manual creatures are Open Content.";

/** Поля статблока из строки каталога SRD. */
export function srdMonsterToStatblockPartial(entry: SrdMonsterCatalogEntry): Partial<MonsterStatblock> {
  return {
    name: entry.nameEn,
    cr: entry.cr,
    ac: entry.ac,
    hpAverage: entry.hpAverage,
    speed: entry.speed,
    statsNote: entry.statsNote,
    extra: `${entry.extra}\n\n— ${ATTRIBUTION_NOTE}`,
    sourceTag: "srd_stub",
    srdCatalogKey: entry.key,
    linkedWikiArticleId: undefined,
  };
}

/** Тело вики для существа из каталога. */
export function wikiBodyDraftFromMonster(entry: SrdMonsterCatalogEntry): string {
  const lines = [
    `# ${entry.nameEn} (${entry.cr} CR, SRD)`,
    "",
    "**AC** " + String(entry.ac) + ", **Avg HP** " + String(entry.hpAverage),
    "**Speed:** " + entry.speed,
    "",
    "**Traits / notes:**",
    entry.statsNote,
    "",
    "**Combat:**",
    entry.extra,
    "",
    ATTRIBUTION_NOTE,
  ];
  return lines.join("\n");
}

export function wikiBodyDraftFromDeity(entry: SrdDeityPreset): string {
  return [
    `# ${entry.nameEn}`,
    "**Alignment:** " + entry.alignment,
    "**Domains (SRD pantheon appendix):** " + entry.domainSummary,
    "",
    "Add your church hierarchy, ceremonies, rivals, and planar ties in prose below:",
    "",
    ATTRIBUTION_NOTE,
  ].join("\n");
}

export function wikiPatchFromMonsterKey(key: string, titleOverride?: string): Partial<WikiArticle> | null {
  const m = getSrdMonsterByKey(key);
  if (!m) return null;
  const title = (titleOverride ?? m.nameEn).trim() || m.nameEn;
  return {
    title,
    slug: slugifyWikiTitle(title),
    category: "creature",
    body: wikiBodyDraftFromMonster(m),
    srdRef: { kind: "monster", key: m.key },
  };
}

export function wikiPatchFromDeityPreset(entry: SrdDeityPreset, titleOverride?: string): Partial<WikiArticle> {
  const title = (titleOverride ?? entry.nameEn).trim() || entry.nameEn;
  return {
    title,
    slug: slugifyWikiTitle(title),
    category: "deity",
    body: wikiBodyDraftFromDeity(entry),
    srdRef: { kind: "deity", key: entry.key },
  };
}

/** Подтягивает параметры столкновения из статьи вики при наличии srdRef монстра. */
export function monsterStatblockFromWikiArticle(article: WikiArticle): Partial<MonsterStatblock> | null {
  const ref = article.srdRef;
  if (!ref || ref.kind !== "monster") return null;
  const entry = getSrdMonsterByKey(ref.key);
  if (!entry) return null;
  return {
    ...srdMonsterToStatblockPartial(entry),
    linkedWikiArticleId: article.id,
    name: article.title.trim() || entry.nameEn,
  };
}
