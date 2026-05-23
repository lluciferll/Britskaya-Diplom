import type { CharacterStatBlock, StatBlockAbilities, StatBlockFeature } from "@/domain/types";

export const CREATURE_TYPES_RU = [
  "Аberрация",
  "Зверь",
  "Небожитель",
  "Конструкт",
  "Дракон",
  "Элементаль",
  "Фея",
  "Исчадие",
  "Великан",
  "Гуманоид",
  "Монстр",
  "Растение",
  "Нежить",
] as const;

export const CREATURE_SIZES_RU = ["Крошечный", "Маленький", "Средний", "Большой", "Огромный", "Громадный"] as const;

export const CHALLENGE_RATINGS = [
  "0",
  "1/8",
  "1/4",
  "1/2",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
] as const;

export const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "СИЛ",
  dex: "ЛОВ",
  con: "ТЕЛ",
  int: "ИНТ",
  wis: "МДР",
  cha: "ХАР",
};

export const ABILITY_SCORES = Array.from({ length: 30 }, (_, i) => i + 1);

export function newFeatureId(): string {
  return `feat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyFeature(name = ""): StatBlockFeature {
  return { id: newFeatureId(), name, text: "" };
}

export function defaultAbilities(): StatBlockAbilities {
  return { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
}

export function defaultStatBlock(): CharacterStatBlock {
  return {
    creatureType: "",
    subtype: "",
    size: "Средний",
    alignment: "",
    ac: "",
    hp: "",
    speed: "30 фт.",
    abilities: defaultAbilities(),
    savingThrows: "",
    skills: "",
    damageVulnerabilities: "",
    damageResistances: "",
    damageImmunities: "",
    conditionImmunities: "",
    senses: "",
    passivePerception: "",
    languages: "",
    cr: "0",
    proficiencyBonus: "+2",
    traits: [],
    actions: [],
    bonusActions: [],
    reactions: [],
    legendaryActions: [],
    description: "",
  };
}

export function normalizeStatBlock(raw?: Partial<CharacterStatBlock> | null): CharacterStatBlock {
  const base = defaultStatBlock();
  if (!raw) return base;
  const abilities = { ...base.abilities, ...(raw.abilities ?? {}) };
  const list = (items: StatBlockFeature[] | undefined) =>
    (items ?? []).map((f) => ({
      id: typeof f.id === "string" ? f.id : newFeatureId(),
      name: typeof f.name === "string" ? f.name : "",
      text: typeof f.text === "string" ? f.text : "",
    }));
  return {
    ...base,
    ...raw,
    abilities,
    traits: list(raw.traits),
    actions: list(raw.actions),
    bonusActions: list(raw.bonusActions),
    reactions: list(raw.reactions),
    legendaryActions: list(raw.legendaryActions),
  };
}

export function abilityModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/** Первое целое число из строки («16 (кожа)», «45 (6d8+18)»). */
export function parseLeadingInt(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const m = value.trim().match(/^(\d+)/);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}

/** Синхронизирует числовые поля партийного стола из текстового статблока. */
export function combatPatchFromStatBlock(statBlock?: CharacterStatBlock): {
  ac?: number;
  maxHp?: number;
  passivePerception?: number;
} {
  if (!statBlock) return {};
  const ac = parseLeadingInt(statBlock.ac);
  const maxHp = parseLeadingInt(statBlock.hp);
  const passivePerception = parseLeadingInt(statBlock.passivePerception);
  return {
    ...(ac !== undefined ? { ac } : {}),
    ...(maxHp !== undefined ? { maxHp } : {}),
    ...(passivePerception !== undefined ? { passivePerception } : {}),
  };
}
