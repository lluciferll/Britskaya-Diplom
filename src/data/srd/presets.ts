import type { SrdDeityPreset, SrdFactionPresetEntry } from "./types";

/**
 * Имена и короткие пометки доменов как в приложениях-пантеонах SRD 5e (OGL).
 */
export const SRD_DEITY_PRESETS: SrdDeityPreset[] = [
  { key: "apollo", nameEn: "Apollo", domainSummary: "Life, Light", alignment: "NG", suggestedWikiCategory: "deity" },
  { key: "ares", nameEn: "Ares", domainSummary: "War", alignment: "CE", suggestedWikiCategory: "deity" },
  { key: "athena", nameEn: "Athena", domainSummary: "Knowledge, War", alignment: "LG", suggestedWikiCategory: "deity" },
  { key: "zeus", nameEn: "Zeus", domainSummary: "Tempest", alignment: "N", suggestedWikiCategory: "deity" },
  { key: "isis", nameEn: "Isis", domainSummary: "Life, Light", alignment: "NG", suggestedWikiCategory: "deity" },
  { key: "re-horakhty", nameEn: "Re-Horakhty", domainSummary: "Life, Light", alignment: "LG", suggestedWikiCategory: "deity" },
  { key: "odin", nameEn: "Odin", domainSummary: "Knowledge, War", alignment: "NG", suggestedWikiCategory: "deity" },
  { key: "thor", nameEn: "Thor", domainSummary: "Tempest", alignment: "NG", suggestedWikiCategory: "deity" },
  { key: "loki", nameEn: "Loki", domainSummary: "Trickery", alignment: "CE", suggestedWikiCategory: "deity" },
];

const GENERIC_STRUCTURE: SrdFactionPresetEntry[] = [
  {
    key: "arcane-university-tone",
    nameRu: "Коллегия магических дисциплин (ярлык структуры)",
    notes:
      "Паттерн «магистрат + студенты»: наполняй списками NPC и заклинаний из журнала. Тексты правил ограничивай открытым SRD или своим хоумбрю.",
  },
  {
    key: "mercenary-company-tone",
    nameRu: "Наёмная рота (боевые NPC из SRD-стражников/бандитов)",
    notes: "Используй пресеты солдат/ветеранов из каталога и свои заметки о контрактах.",
  },
  {
    key: "wilderness-conclave-tone",
    nameRu: "Ремесленный совет диких земель (друиды/рейнджеры как концепт)",
    notes: "Привязка к лору без копирования защищённых строк из коммерческих приключений.",
  },
];

export const SRD_FACTION_PRESETS: SrdFactionPresetEntry[] = [
  ...GENERIC_STRUCTURE,
  ...SRD_DEITY_PRESETS.map(
    (d): SrdFactionPresetEntry => ({
      key: `temple-${d.key}`,
      nameRu: `Культ или орден: ${d.nameEn} (${d.alignment})`,
      nameEn: `Temple circuit — ${d.nameEn}`,
      notes: `Пантеон SRD • домены: ${d.domainSummary}. Дополни название земного храма и графики праздников сам.`,
    }),
  ),
];
