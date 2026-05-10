/** Включаемые «жёсткие» вкладки/подсистемы кампании (по умолчанию всё активно). */
export type ForgeModuleId =
  | "loreGraph"
  | "sessionPlanner"
  | "encounterLab"
  | "partyLibrary"
  | "timeline"
  | "factions"
  | "locations"
  | "characters"
  | "quests"
  | "gallery"
  | "sessionLogs";

export type CampaignForgeModules = Record<ForgeModuleId, boolean>;

export const FORGE_MODULE_LABELS: Record<ForgeModuleId, string> = {
  loreGraph: "Граф связей",
  sessionPlanner: "Планы сессий",
  encounterLab: "Столкновения",
  partyLibrary: "Партия · книги",
  timeline: "Таймлайн",
  factions: "Фракции",
  locations: "Локации",
  characters: "Персонажи",
  quests: "Квесты",
  gallery: "Галерея",
  sessionLogs: "Лог сессий",
};

/** Порядок чекбоксов в интерфейсе настроек. */
export const FORGE_MODULE_IDS = Object.keys(FORGE_MODULE_LABELS) as ForgeModuleId[];

export function defaultForgeModules(): CampaignForgeModules {
  const m = {} as CampaignForgeModules;
  FORGE_MODULE_IDS.forEach((k) => {
    /** Граф лора — узкая штука: по умолчанию выключен, чтобы вкладки были проще */
    m[k] = k === "loreGraph" ? false : true;
  });
  return m;
}

/** Слить сохранённые флаги с полным набором ключей и применить частичное обновление. */
export function mergeForgeModules(patchFromSave?: Partial<CampaignForgeModules> | null): CampaignForgeModules {
  const base = defaultForgeModules();
  if (!patchFromSave) return base;
  for (const k of Object.keys(base) as ForgeModuleId[]) {
    if (typeof patchFromSave[k] === "boolean") base[k] = patchFromSave[k]!;
  }
  return base;
}

export function applyForgeModulesPatch(current: CampaignForgeModules | undefined, patch: Partial<CampaignForgeModules>): CampaignForgeModules {
  const base = mergeForgeModules(current);
  for (const k of Object.keys(patch) as ForgeModuleId[]) {
    if (typeof patch[k] === "boolean") base[k] = patch[k]!;
  }
  return base;
}
