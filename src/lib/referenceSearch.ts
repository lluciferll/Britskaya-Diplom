import type { ReferenceCategoryId, ReferenceEntry } from "@/data/reference/types";
import { getAllReferenceEntries, getReferenceEntriesByCategory } from "@/data/reference";

function norm(s: string): string {
  return s.toLowerCase().trim();
}

export function entryHaystack(entry: ReferenceEntry): string {
  return norm(
    [entry.nameRu, entry.nameEn ?? "", entry.subtitle, entry.summary, entry.body, ...(entry.tags ?? [])].join(" "),
  );
}

export function filterReferenceEntries(
  entries: ReferenceEntry[],
  query: string,
): ReferenceEntry[] {
  const q = norm(query);
  if (!q) return entries;
  return entries.filter((e) => entryHaystack(e).includes(q));
}

export function searchReference(
  query: string,
  category: ReferenceCategoryId | "all",
): ReferenceEntry[] {
  const pool = category === "all" ? getAllReferenceEntries() : getReferenceEntriesByCategory(category);
  const filtered = filterReferenceEntries(pool, query);
  return filtered.sort((a, b) => a.nameRu.localeCompare(b.nameRu, "ru"));
}

export function entryId(entry: ReferenceEntry): string {
  return `${entry.category}:${entry.key}`;
}
