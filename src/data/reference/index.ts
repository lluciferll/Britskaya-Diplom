import type { ReferenceCategoryId, ReferenceEntry } from "./types";
import { REFERENCE_DEITIES } from "./deities";
import { REFERENCE_DEITIES_EXTRA } from "./deities-extra";
import { REFERENCE_FEATS } from "./feats";
import { REFERENCE_INVOCATIONS } from "./invocations";
import { REFERENCE_MAGIC_ITEMS } from "./magicItems";
import { REFERENCE_MONSTERS } from "./monsters";
import { REFERENCE_MONSTERS_EXTRA } from "./monsters-extra";
import { REFERENCE_SPELLS } from "./spells";

const ALL_ENTRIES: ReferenceEntry[] = [
  ...REFERENCE_SPELLS,
  ...REFERENCE_FEATS,
  ...REFERENCE_INVOCATIONS,
  ...REFERENCE_MAGIC_ITEMS,
  ...REFERENCE_MONSTERS,
  ...REFERENCE_MONSTERS_EXTRA,
  ...REFERENCE_DEITIES,
  ...REFERENCE_DEITIES_EXTRA,
];

const byCategory = new Map<ReferenceCategoryId, ReferenceEntry[]>();

for (const cat of ["spells", "feats", "invocations", "magic-items", "monsters", "deities"] as ReferenceCategoryId[]) {
  byCategory.set(
    cat,
    ALL_ENTRIES.filter((e) => e.category === cat).sort((a, b) => a.nameRu.localeCompare(b.nameRu, "ru")),
  );
}

const byKey = new Map<string, ReferenceEntry>();
for (const e of ALL_ENTRIES) {
  byKey.set(`${e.category}:${e.key}`, e);
}

export function getAllReferenceEntries(): ReferenceEntry[] {
  return ALL_ENTRIES;
}

export function getReferenceEntriesByCategory(category: ReferenceCategoryId): ReferenceEntry[] {
  return byCategory.get(category) ?? [];
}

export function getReferenceEntry(category: ReferenceCategoryId, key: string): ReferenceEntry | undefined {
  return byKey.get(`${category}:${key}`);
}

export function getReferenceCounts(): Record<ReferenceCategoryId, number> {
  return {
    spells: byCategory.get("spells")?.length ?? 0,
    feats: byCategory.get("feats")?.length ?? 0,
    invocations: byCategory.get("invocations")?.length ?? 0,
    "magic-items": byCategory.get("magic-items")?.length ?? 0,
    monsters: byCategory.get("monsters")?.length ?? 0,
    deities: byCategory.get("deities")?.length ?? 0,
  };
}

export function getTotalReferenceCount(): number {
  return ALL_ENTRIES.length;
}
