export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type WeaponRow = {
  name: string;
  atk: string;
  damage: string;
  notes: string;
};

export type SpellRow = {
  level: string;
  name: string;
  castingTime: string;
  range: string;
  concentration: boolean;
  ritual: boolean;
  material: boolean;
  notes: string;
};

export type CharacterSheetData = {
  meta: {
    name: string;
    background: string;
    className: string;
    species: string;
    subclass: string;
    level: string;
    xp: string;
    alignment: string;
  };
  combat: {
    profBonus: string;
    ac: string;
    shield: boolean;
    initiative: string;
    speed: string;
    size: string;
    passivePerception: string;
  };
  abilities: Record<AbilityKey, { score: string; saveProf: boolean }>;
  skills: Record<string, { proficient: boolean; bonus: string }>;
  hp: { current: string; temp: string; max: string; hitDiceSpent: string; hitDiceMax: string };
  deathSaves: { successes: number; failures: number };
  weapons: WeaponRow[];
  armorTraining: { light: boolean; medium: boolean; heavy: boolean; shields: boolean };
  weaponProficiencies: string;
  toolProficiencies: string;
  classFeatures: string;
  speciesTraits: string;
  feats: string;
  spellcasting: {
    ability: string;
    modifier: string;
    saveDc: string;
    attackBonus: string;
    slotsTotal: string[];
    slotsUsed: string[];
  };
  spells: SpellRow[];
  appearance: string;
  languages: string;
  equipment: string;
  attunement: [boolean, boolean, boolean];
  coins: { cp: string; sp: string; ep: string; gp: string; pp: string };
  preparedSpellsExtra: SpellRow[];
  spellNotes: string;
};

export const SKILL_KEYS = [
  "athletics",
  "acrobatics",
  "sleight",
  "stealth",
  "arcana",
  "history",
  "investigation",
  "nature",
  "religion",
  "animal",
  "insight",
  "medicine",
  "perception",
  "survival",
  "deception",
  "intimidation",
  "performance",
  "persuasion",
] as const;

export const SKILL_LABELS: Record<(typeof SKILL_KEYS)[number], string> = {
  athletics: "Атлетика",
  acrobatics: "Акробатика",
  sleight: "Ловкость рук",
  stealth: "Скрытность",
  arcana: "Магия",
  history: "История",
  investigation: "Анализ",
  nature: "Природа",
  religion: "Религия",
  animal: "Уход за животными",
  insight: "Проницательность",
  medicine: "Медицина",
  perception: "Внимательность",
  survival: "Выживание",
  deception: "Обман",
  intimidation: "Запугивание",
  performance: "Выступление",
  persuasion: "Убеждение",
};
