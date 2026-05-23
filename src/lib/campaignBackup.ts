import { mergeForgeModules } from "@/domain/forgeModules";
import type { Campaign } from "@/domain/types";
import { slugifyWikiTitle } from "@/lib/wikiLinking";
import { normalizeStatBlock } from "@/lib/characterStatBlock";

const defaultHorror = () =>
  ({
    enabled: false,
    stressCap: 10,
    corruptionNotes: "",
    environmentNotes: "",
    corruptionIndex: 0,
    corruptionStep: 1,
    applyStressWithCorruption: false,
  }) satisfies Campaign["horrorToolkit"];

export const BACKUP_FORMAT = "master-forge-backup" as const;
export const SINGLE_FORMAT = "master-forge-campaign" as const;

export type BackupFileV2 = {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  campaigns: Campaign[];
};

export type SingleCampaignFile = {
  format: typeof SINGLE_FORMAT;
  version: number;
  exportedAt: string;
  campaign: Campaign;
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/** Минимальная проверка и пропуск лишних полей — данные из старых версий подмешиваем к дефолтам при импорте в store. */
export function parseBackupJson(json: string): { kind: "full"; data: BackupFileV2 } | { kind: "single"; data: SingleCampaignFile } | { kind: "error"; message: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    return { kind: "error", message: "Файл не является корректным JSON." };
  }
  if (!isRecord(parsed)) return { kind: "error", message: "Неверная структура." };

  const format = parsed.format;
  if (format === BACKUP_FORMAT) {
    const campaigns = parsed.campaigns;
    if (!Array.isArray(campaigns)) return { kind: "error", message: "В резервной копии нет массива campaigns." };
    return {
      kind: "full",
      data: {
        format: BACKUP_FORMAT,
        version: Number(parsed.version) || 1,
        exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : new Date().toISOString(),
        campaigns: campaigns as Campaign[],
      },
    };
  }
  if (format === SINGLE_FORMAT) {
    const c = parsed.campaign;
    if (!isRecord(c) || typeof c.id !== "string") return { kind: "error", message: "В файле нет объекта campaign с id." };
    return {
      kind: "single",
      data: {
        format: SINGLE_FORMAT,
        version: Number(parsed.version) || 1,
        exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : new Date().toISOString(),
        campaign: c as Campaign,
      },
    };
  }
  return { kind: "error", message: "Неизвестный формат файла (ожидался master-forge-backup или master-forge-campaign)." };
}

export function downloadTextFile(filename: string, text: string): void {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Подмешивает недостающие поля после импорта из файла / старой версии. */
export function ensureImportedCampaign(c: Campaign): Campaign {
  const session = c.session;
  const map = c.map;
  return {
    ...c,
    modules: mergeForgeModules((c as Campaign).modules),
    tags: c.tags ?? [],
    timeline: c.timeline ?? [],
    factions: (c.factions ?? []).map((f) => ({
      ...f,
      srdPresetKey: typeof f.srdPresetKey === "string" ? f.srdPresetKey : undefined,
    })),
    locations: c.locations ?? [],
    characters: (c.characters ?? []).map((ch) => ({
      ...ch,
      inspiration: ch.inspiration ?? false,
      tags: typeof ch.tags === "string" ? ch.tags : undefined,
      personality: typeof ch.personality === "string" ? ch.personality : undefined,
      secret: typeof ch.secret === "string" ? ch.secret : undefined,
      motivation: typeof ch.motivation === "string" ? ch.motivation : undefined,
      statHint: typeof ch.statHint === "string" ? ch.statHint : undefined,
      statBlock: ch.statBlock ? normalizeStatBlock(ch.statBlock) : undefined,
    })),
    quests: c.quests ?? [],
    sessionLogs: c.sessionLogs ?? [],
    gallery: c.gallery ?? [],
    wikiArticles: (c.wikiArticles ?? []).map((w, i) => {
      const t = typeof w.updatedAt === "string" ? w.updatedAt : w.createdAt ?? new Date().toISOString();
      return {
        ...w,
        slug: typeof w.slug === "string" && w.slug.trim() ? w.slug.trim() : slugifyWikiTitle(w.title || `статья-${i}`),
        category: w.category ?? "other",
        srdRef:
          w.srdRef &&
          typeof w.srdRef === "object" &&
          (w.srdRef.kind === "monster" || w.srdRef.kind === "deity") &&
          typeof w.srdRef.key === "string"
            ? { kind: w.srdRef.kind, key: w.srdRef.key }
            : undefined,
        body: typeof w.body === "string" ? w.body : "",
        createdAt: typeof w.createdAt === "string" ? w.createdAt : t,
        updatedAt: t,
      };
    }),
    sessionPlans: (c.sessionPlans ?? []).map((sp) => ({
      ...sp,
      blocks: (sp.blocks ?? []).map((b) => ({ ...b, order: typeof b.order === "number" ? b.order : 0 })),
    })),
    monsterBlocks: (c.monsterBlocks ?? []).map((mb) => ({
      ...mb,
      srdCatalogKey: typeof mb.srdCatalogKey === "string" ? mb.srdCatalogKey : undefined,
      linkedWikiArticleId: typeof mb.linkedWikiArticleId === "string" ? mb.linkedWikiArticleId : undefined,
    })),
    encounters: (c.encounters ?? []).map((en) => ({
      ...en,
      monsterQuantities: en.monsterQuantities ?? [],
    })),
    quickDrops: c.quickDrops ?? [],
    libraryDocs: (c.libraryDocs ?? []).map((d) => ({ ...d, tags: d.tags ?? [] })),
    homebrewDefinitions: c.homebrewDefinitions ?? [],
    loreGraphExtras: c.loreGraphExtras ?? [],
    horrorToolkit: { ...defaultHorror(), ...(c.horrorToolkit ?? {}) },
    houserulesMarkdown: c.houserulesMarkdown ?? "",
    lootAndRewardsLog: c.lootAndRewardsLog ?? "",
    session: {
      timerStartedAt: session?.timerStartedAt ?? null,
      elapsedBeforePauseMs: session?.elapsedBeforePauseMs ?? 0,
      paused: session?.paused ?? true,
      gmNotes: session?.gmNotes ?? "",
      playerNotes: session?.playerNotes ?? "",
      combatants: session?.combatants ?? [],
      diceLog: session?.diceLog ?? [],
    },
    map: {
      fogSize: map?.fogSize ?? 12,
      revealed: map?.revealed ?? {},
      tokens: map?.tokens ?? [],
      backgroundUrl: map?.backgroundUrl ?? "",
      gridPx: map?.gridPx ?? 48,
      showGrid: map?.showGrid ?? true,
      watabouCity: map?.watabouCity,
      mapWorkspaceTab: map?.mapWorkspaceTab,
      aideddAtlasKey: map?.aideddAtlasKey,
    },
  };
}
