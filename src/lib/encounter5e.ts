/**
 * Математика «сложности встречи» в духе D&D 5e: пороги XP на персонажа и XP за CR,
 * множитель за число монстров. Числа совпадают с Книгой Мастира / базовым сетом правил (столы опыта).
 */

export type DifficultyTier = "trivial" | "easy" | "medium" | "hard" | "deadly" | "over";

/** Пороги XP за одного персонажа (Easy / Medium / Hard / Deadly), уровни 1–20. */
export const XP_THRESHOLD_ONE_PC: Record<number, [number, number, number, number]> = {
  1: [25, 50, 75, 100],
  2: [50, 100, 150, 200],
  3: [75, 150, 225, 400],
  4: [125, 250, 375, 500],
  5: [250, 500, 750, 1100],
  6: [300, 600, 900, 1400],
  7: [350, 750, 1100, 1700],
  8: [450, 900, 1400, 2100],
  9: [550, 1100, 1600, 2400],
  10: [600, 1200, 1900, 2800],
  11: [800, 1600, 2400, 3600],
  12: [1000, 2000, 3000, 4500],
  13: [1100, 2200, 3400, 5100],
  14: [1250, 2500, 3800, 5700],
  15: [1400, 2800, 4300, 6400],
  16: [1600, 3200, 4800, 7200],
  17: [2000, 3900, 5900, 8800],
  18: [2100, 4200, 6300, 9500],
  19: [2400, 4900, 7300, 10900],
  20: [2800, 5700, 8500, 12700],
};

/** Опыт за одно существо данного CR (для суммирования встречи). */
export const XP_BY_CR = new Map<string, number>([
  ["0", 10],
  ["1/8", 25],
  ["1/4", 50],
  ["1/2", 100],
  ["1", 200],
  ["2", 450],
  ["3", 700],
  ["4", 1100],
  ["5", 1800],
  ["6", 2300],
  ["7", 2900],
  ["8", 3900],
  ["9", 5000],
  ["10", 5900],
  ["11", 7200],
  ["12", 8400],
  ["13", 10000],
  ["14", 11500],
  ["15", 13000],
  ["16", 15000],
  ["17", 18000],
  ["18", 20000],
  ["19", 22000],
  ["20", 25000],
  ["21", 33000],
  ["22", 41000],
  ["23", 50000],
  ["24", 62000],
  ["25", 75000],
  ["26", 90000],
  ["27", 105000],
  ["28", 120000],
  ["29", 135000],
  ["30", 155000],
]);

export function encounterMultiplier(monsterCount: number): number {
  if (monsterCount <= 1) return 1;
  if (monsterCount === 2) return 1.5;
  if (monsterCount >= 3 && monsterCount <= 6) return 2;
  if (monsterCount >= 7 && monsterCount <= 10) return 2.5;
  if (monsterCount >= 11 && monsterCount <= 14) return 3;
  return 4;
}

export function partyThresholds(partyLevel: number, partySize: number): { easy: number; medium: number; hard: number; deadly: number } {
  const L = Math.max(1, Math.min(20, Math.round(partyLevel)));
  const N = Math.max(1, Math.min(12, Math.round(partySize)));
  const row = XP_THRESHOLD_ONE_PC[L] ?? XP_THRESHOLD_ONE_PC[1];
  return {
    easy: row[0] * N,
    medium: row[1] * N,
    hard: row[2] * N,
    deadly: row[3] * N,
  };
}

export function parseCrToXp(cr: string): number | null {
  const k = cr.trim().toLowerCase().replace(",", ".");
  if (XP_BY_CR.has(k)) return XP_BY_CR.get(k)!;
  const n = Number(k);
  if (Number.isFinite(n) && XP_BY_CR.has(String(n))) return XP_BY_CR.get(String(n))!;
  return null;
}

export function classifyEncounter(adjustedXp: number, partyLevel: number, partySize: number): DifficultyTier {
  const t = partyThresholds(partyLevel, partySize);
  if (adjustedXp <= 0) return "trivial";
  if (adjustedXp < t.easy) return "trivial";
  if (adjustedXp < t.medium) return "easy";
  if (adjustedXp < t.hard) return "medium";
  if (adjustedXp < t.deadly) return "hard";
  if (adjustedXp <= t.deadly * 1.5) return "deadly";
  return "over";
}

export function encounterSummary(opts: {
  partyLevel: number;
  partySize: number;
  /** CR строками: "1/2", "2", "0" и т.д. */
  monsterCrs: string[];
}): {
  rawXp: number;
  adjustedXp: number;
  multiplier: number;
  monsterCount: number;
  thresholds: ReturnType<typeof partyThresholds>;
  tier: DifficultyTier;
  unknownCrs: string[];
} {
  const cleaned = opts.monsterCrs.map((c) => c.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    const thresholds = partyThresholds(opts.partyLevel, opts.partySize);
    return {
      rawXp: 0,
      adjustedXp: 0,
      multiplier: 1,
      monsterCount: 0,
      thresholds,
      tier: "trivial",
      unknownCrs: [] as string[],
    };
  }

  const monsterCount = cleaned.length;
  const unknownCrs: string[] = [];
  let rawXp = 0;
  for (const cr of cleaned) {
    const xp = parseCrToXp(cr);
    if (xp === null) unknownCrs.push(cr);
    else rawXp += xp;
  }
  const mult = encounterMultiplier(monsterCount);
  const adjustedXp = Math.floor(rawXp * mult);
  const thresholds = partyThresholds(opts.partyLevel, opts.partySize);
  const tier = classifyEncounter(adjustedXp, opts.partyLevel, opts.partySize);

  return {
    rawXp,
    adjustedXp,
    multiplier: mult,
    monsterCount,
    thresholds,
    tier,
    unknownCrs,
  };
}
