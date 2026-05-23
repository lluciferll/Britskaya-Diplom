import type { AbilityKey } from "@/lib/characterSheet/types";
import { SKILL_KEYS } from "@/lib/characterSheet/types";

export const ABILITY_ORDER: { key: AbilityKey; label: string }[] = [
  { key: "str", label: "Сила" },
  { key: "dex", label: "Ловкость" },
  { key: "con", label: "Телосложение" },
  { key: "int", label: "Интеллект" },
  { key: "wis", label: "Мудрость" },
  { key: "cha", label: "Харизма" },
];

export const ABILITY_SHORT: Record<AbilityKey, string> = {
  str: "СИЛ",
  dex: "ЛОВ",
  con: "ТЕЛ",
  int: "ИНТ",
  wis: "МДР",
  cha: "ХАР",
};

export const SKILL_BY_ABILITY: Record<AbilityKey, (typeof SKILL_KEYS)[number][]> = {
  str: ["athletics"],
  dex: ["acrobatics", "sleight", "stealth"],
  con: [],
  int: ["arcana", "history", "investigation", "nature", "religion"],
  wis: ["animal", "insight", "medicine", "perception", "survival"],
  cha: ["deception", "intimidation", "performance", "persuasion"],
};
