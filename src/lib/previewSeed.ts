import type { Campaign } from "@/domain/types";
import { defaultForgeModules } from "@/domain/forgeModules";
import { ensureImportedCampaign } from "@/lib/campaignBackup";

export const PREVIEW_CAMPAIGN_ID = "preview-demo-campaign";

/** Демо-кампания для режима предпросмотра (только localStorage, без облака). */
export function getPreviewSeedCampaigns(): Campaign[] {
  const t = new Date().toISOString();
  const raw: Campaign = {
    id: PREVIEW_CAMPAIGN_ID,
    title: "Туманы Утёса (предпросмотр)",
    system: "D&D 5e",
    partyLevel: 3,
    tone: "героический мрак",
    tags: ["демо", "диплом"],
    createdAt: t,
    updatedAt: t,
    timeline: [
      {
        id: "preview-timeline-1",
        title: "Шёпот в доках",
        notes: "Партия высадилась в тумане. Крики чаек смешались с церковным колоколом.",
        createdAt: t,
      },
    ],
    factions: [
      {
        id: "preview-faction-1",
        name: "Смотрители маяка",
        notes: "Не пускают чужаков к руинам; настроены настороженно.",
      },
    ],
    locations: [
      {
        id: "preview-loc-1",
        name: "Старый маяк",
        tier: "building",
        notes: "Верхняя площадка открыта, внизу — затопленный зал.",
      },
    ],
    characters: [
      {
        id: "preview-char-1",
        name: "Элара",
        kind: "pc",
        summary: "Жрец 3 уровня; носит амулет морской богини.",
        tags: "жрец",
      },
    ],
    quests: [{ id: "preview-quest-1", title: "Разобраться с пропажей рыбаков", status: "active", notes: "" }],
    sessionLogs: [],
    gallery: [],
    session: {
      timerStartedAt: null,
      elapsedBeforePauseMs: 0,
      paused: true,
      gmNotes: "Демо-стол: таймер, кубики и заметки доступны в разделе «Игровой стол».",
      playerNotes: "",
      combatants: [],
      diceLog: [],
    },
    map: {
      fogSize: 12,
      revealed: {},
      tokens: [],
      backgroundUrl: "",
      gridPx: 48,
      showGrid: true,
    },
    wikiArticles: [
      {
        id: "preview-wiki-1",
        title: "Утёс Вороний",
        slug: "utoes-voronij",
        category: "city",
        body: "Поселение рыбаков. Ночью слышны странные гудки из моря.",
        createdAt: t,
        updatedAt: t,
      },
    ],
    sessionPlans: [],
    monsterBlocks: [],
    encounters: [],
    quickDrops: [],
    libraryDocs: [],
    homebrewDefinitions: [],
    loreGraphExtras: [],
    horrorToolkit: {
      enabled: false,
      stressCap: 10,
      corruptionNotes: "",
      environmentNotes: "",
      corruptionIndex: 0,
      corruptionStep: 1,
      applyStressWithCorruption: false,
    },
    houserulesMarkdown: "",
    lootAndRewardsLog: "",
    modules: defaultForgeModules(),
  };
  return [ensureImportedCampaign(raw)];
}
