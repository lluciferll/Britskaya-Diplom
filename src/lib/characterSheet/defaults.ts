import type { CharacterSheetData, SpellRow, WeaponRow } from "@/lib/characterSheet/types";

const emptyWeapon = (): WeaponRow => ({ name: "", atk: "", damage: "", notes: "" });
const emptySpell = (): SpellRow => ({
  level: "",
  name: "",
  castingTime: "",
  range: "",
  concentration: false,
  ritual: false,
  material: false,
  notes: "",
});

export function createEmptyCharacterSheet(): CharacterSheetData {
  return {
    meta: {
      name: "",
      background: "",
      className: "",
      species: "",
      subclass: "",
      level: "1",
      xp: "",
      alignment: "",
    },
    combat: {
      profBonus: "+2",
      ac: "",
      shield: false,
      initiative: "",
      speed: "30",
      size: "Средний",
      passivePerception: "",
    },
    abilities: {
      str: { score: "10", saveProf: false },
      dex: { score: "10", saveProf: false },
      con: { score: "10", saveProf: false },
      int: { score: "10", saveProf: false },
      wis: { score: "10", saveProf: false },
      cha: { score: "10", saveProf: false },
    },
    skills: Object.fromEntries(
      [
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
      ].map((k) => [k, { proficient: false, bonus: "" }]),
    ),
    hp: { current: "", temp: "", max: "", hitDiceSpent: "", hitDiceMax: "1d8" },
    deathSaves: { successes: 0, failures: 0 },
    weapons: [emptyWeapon(), emptyWeapon(), emptyWeapon(), emptyWeapon()],
    armorTraining: { light: false, medium: false, heavy: false, shields: false },
    weaponProficiencies: "",
    toolProficiencies: "",
    classFeatures: "",
    speciesTraits: "",
    feats: "",
    spellcasting: {
      ability: "",
      modifier: "",
      saveDc: "",
      attackBonus: "",
      slotsTotal: Array(9).fill(""),
      slotsUsed: Array(9).fill(""),
    },
    spells: Array.from({ length: 13 }, emptySpell),
    appearance: "",
    languages: "",
    equipment: "",
    attunement: [false, false, false],
    coins: { cp: "0", sp: "0", ep: "0", gp: "0", pp: "0" },
    preparedSpellsExtra: Array.from({ length: 18 }, emptySpell),
    spellNotes: "",
  };
}

export const CHARACTER_SHEET_LS_KEY = "master-forge:character-sheet-draft";
