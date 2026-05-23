import type { Campaign, EncounterBuild } from "@/domain/types";
import { encounterSummary, type DifficultyTier } from "@/lib/encounter5e";

export function collectEncounterCrs(
  campaign: Pick<Campaign, "monsterBlocks">,
  enc: EncounterBuild,
): string[] {
  const crs: string[] = [];
  for (const row of enc.monsterQuantities ?? []) {
    const m = campaign.monsterBlocks?.find((x) => x.id === row.monsterId);
    if (!m) continue;
    const n = Math.max(1, row.count);
    for (let i = 0; i < n; i += 1) crs.push(String(m.cr).trim());
  }
  return crs;
}

export function summarizeEncounterBuild(
  campaign: Pick<Campaign, "partyLevel" | "monsterBlocks">,
  enc: EncounterBuild,
  partySize: number,
): ReturnType<typeof encounterSummary> | null {
  const crs = collectEncounterCrs(campaign, enc);
  if (!crs.length) return null;
  return encounterSummary({
    partyLevel: campaign.partyLevel,
    partySize,
    monsterCrs: crs,
  });
}

export const DIFFICULTY_TIER_RU: Record<DifficultyTier, string> = {
  trivial: "Лёгкая разминка",
  easy: "Лёгкая",
  medium: "Средняя",
  hard: "Тяжёлая",
  deadly: "Смертельная",
  over: "Сильнее порога",
};
