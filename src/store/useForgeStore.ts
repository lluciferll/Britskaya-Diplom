"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  BattleMapState,
  Campaign,
  Combatant,
  DiceRollEntry,
  EncounterBuild,
  GalleryItem,
  HomebrewRecord,
  LibraryDocument,
  LoreGraphManualEdge,
  MonsterStatblock,
  QuickDrop,
  SessionPlanBlock,
  SessionPlanMeeting,
  WikiArticle,
} from "@/domain/types";
import { applyForgeModulesPatch, defaultForgeModules } from "@/domain/forgeModules";
import type { CampaignForgeModules } from "@/domain/forgeModules";
import { BACKUP_FORMAT, SINGLE_FORMAT, ensureImportedCampaign, parseBackupJson } from "@/lib/campaignBackup";
import { FORGE_LS_KEY } from "@/lib/forgeStorageConstants";
import { slugifyWikiTitle } from "@/lib/wikiLinking";
import { newId } from "@/lib/id";

function nowIso(): string {
  return new Date().toISOString();
}

const defaultBattleMap = (): BattleMapState => ({
  fogSize: 12,
  revealed: {},
  tokens: [],
  backgroundUrl: "",
  gridPx: 48,
  showGrid: true,
});

const defaultSession = () => ({
  timerStartedAt: null as string | null,
  elapsedBeforePauseMs: 0,
  paused: true,
  gmNotes: "",
  playerNotes: "",
  combatants: [] as Combatant[],
  diceLog: [] as DiceRollEntry[],
});

function defaultCampaign(title: string): Campaign {
  const t = nowIso();
  return {
    id: newId(),
    title,
    system: "D&D 5e",
    partyLevel: 3,
    tone: "героический мрак",
    tags: [],
    createdAt: t,
    updatedAt: t,
    timeline: [],
    factions: [],
    locations: [],
    characters: [],
    quests: [],
    sessionLogs: [],
    gallery: [],
    session: defaultSession(),
    map: defaultBattleMap(),
    wikiArticles: [],
    sessionPlans: [],
    monsterBlocks: [],
    encounters: [],
    quickDrops: [],
    libraryDocs: [],
    homebrewDefinitions: [],
    loreGraphExtras: [],
    horrorToolkit: horrorDefaults(),
    houserulesMarkdown: "",
    lootAndRewardsLog: "",
    modules: defaultForgeModules(),
  };
}

function touch(c: Campaign): Campaign {
  return { ...c, updatedAt: nowIso() };
}

const horrorDefaults = (): Campaign["horrorToolkit"] => ({
  enabled: false,
  stressCap: 10,
  corruptionNotes: "",
  environmentNotes: "",
  corruptionIndex: 0,
  corruptionStep: 1,
  applyStressWithCorruption: false,
});

type ForgeState = {
  campaigns: Campaign[];
  createCampaign: (title: string) => string;
  updateCampaignMeta: (
    id: string,
    patch: Partial<Pick<Campaign, "title" | "system" | "partyLevel" | "tone" | "tags">>,
  ) => void;
  patchCampaignModules: (campaignId: string, patch: Partial<CampaignForgeModules>) => void;
  deleteCampaign: (id: string) => void;

  addTimelineEntry: (campaignId: string, payload: Omit<Campaign["timeline"][number], "id" | "createdAt">) => void;
  updateTimelineEntry: (campaignId: string, entryId: string, patch: Partial<Campaign["timeline"][number]>) => void;
  removeTimelineEntry: (campaignId: string, entryId: string) => void;

  addFaction: (campaignId: string, payload: Omit<Campaign["factions"][number], "id">) => void;
  updateFaction: (campaignId: string, factionId: string, patch: Partial<Campaign["factions"][number]>) => void;
  removeFaction: (campaignId: string, factionId: string) => void;

  addLocation: (campaignId: string, payload: Omit<Campaign["locations"][number], "id">) => void;
  updateLocation: (campaignId: string, locId: string, patch: Partial<Campaign["locations"][number]>) => void;
  removeLocation: (campaignId: string, locId: string) => void;

  addCharacter: (campaignId: string, payload: Omit<Campaign["characters"][number], "id">) => void;
  updateCharacter: (campaignId: string, charId: string, patch: Partial<Campaign["characters"][number]>) => void;
  removeCharacter: (campaignId: string, charId: string) => void;

  addQuest: (campaignId: string, payload: Omit<Campaign["quests"][number], "id">) => void;
  updateQuest: (campaignId: string, questId: string, patch: Partial<Campaign["quests"][number]>) => void;
  removeQuest: (campaignId: string, questId: string) => void;

  addSessionLog: (campaignId: string, payload: Omit<Campaign["sessionLogs"][number], "id">) => void;
  updateSessionLog: (campaignId: string, logId: string, patch: Partial<Campaign["sessionLogs"][number]>) => void;
  removeSessionLog: (campaignId: string, logId: string) => void;

  addGalleryItem: (campaignId: string, payload: Omit<GalleryItem, "id">) => void;
  updateGalleryItem: (campaignId: string, itemId: string, patch: Partial<GalleryItem>) => void;
  removeGalleryItem: (campaignId: string, itemId: string) => void;

  patchSessionState: (campaignId: string, patch: Partial<Campaign["session"]>) => void;
  appendDiceRoll: (campaignId: string, roll: Omit<DiceRollEntry, "id">) => void;
  clearDiceLog: (campaignId: string) => void;
  reorderCombatants: (campaignId: string, idsInOrder: string[]) => void;
  patchBattleMap: (campaignId: string, patch: Partial<BattleMapState>) => void;

  patchCampaignWritings: (
    campaignId: string,
    patch: Partial<Pick<Campaign, "houserulesMarkdown" | "lootAndRewardsLog" | "horrorToolkit">>,
  ) => void;

  addWikiArticle: (campaignId: string, payload: Omit<WikiArticle, "id" | "createdAt" | "updatedAt" | "slug"> & { slug?: string }) => void;
  updateWikiArticle: (campaignId: string, articleId: string, patch: Partial<WikiArticle>) => void;
  removeWikiArticle: (campaignId: string, articleId: string) => void;

  addSessionMeeting: (
    campaignId: string,
    payload: Pick<SessionPlanMeeting, "title"> &
      Partial<Pick<SessionPlanMeeting, "whenLabel" | "narrativeOrder">> & {
        blocks?: Omit<SessionPlanBlock, "id" | "order">[];
      },
  ) => void;
  removeSessionMeeting: (campaignId: string, meetingId: string) => void;
  updateSessionMeeting: (campaignId: string, meetingId: string, patch: Partial<Pick<SessionPlanMeeting, "title" | "whenLabel" | "narrativeOrder">>) => void;
  reorderSessionMeetings: (campaignId: string, meetingIdsOrdered: string[]) => void;
  addSessionBlock: (campaignId: string, meetingId: string, payload: Omit<SessionPlanBlock, "id" | "order">) => void;
  updateSessionBlock: (campaignId: string, meetingId: string, blockId: string, patch: Partial<SessionPlanBlock>) => void;
  removeSessionBlock: (campaignId: string, meetingId: string, blockId: string) => void;
  reorderSessionBlocks: (campaignId: string, meetingId: string, blockIdsOrdered: string[]) => void;

  addMonsterBlock: (campaignId: string, payload: Omit<MonsterStatblock, "id">) => void;
  updateMonsterBlock: (campaignId: string, monsterId: string, patch: Partial<MonsterStatblock>) => void;
  removeMonsterBlock: (campaignId: string, monsterId: string) => void;

  addEncounterBuild: (campaignId: string, payload: Omit<EncounterBuild, "id">) => void;
  updateEncounterBuild: (campaignId: string, encounterId: string, patch: Partial<EncounterBuild>) => void;
  removeEncounterBuild: (campaignId: string, encounterId: string) => void;

  addQuickDrop: (campaignId: string, payload: Omit<QuickDrop, "id">) => void;
  updateQuickDrop: (campaignId: string, dropId: string, patch: Partial<QuickDrop>) => void;
  removeQuickDrop: (campaignId: string, dropId: string) => void;

  addLibraryDoc: (campaignId: string, payload: Omit<LibraryDocument, "id">) => void;
  updateLibraryDoc: (campaignId: string, docId: string, patch: Partial<LibraryDocument>) => void;
  removeLibraryDoc: (campaignId: string, docId: string) => void;

  addHomebrewRecord: (campaignId: string, payload: Omit<HomebrewRecord, "id">) => void;
  updateHomebrewRecord: (campaignId: string, recordId: string, patch: Partial<HomebrewRecord>) => void;
  removeHomebrewRecord: (campaignId: string, recordId: string) => void;

  addLoreManualEdge: (campaignId: string, payload: Omit<LoreGraphManualEdge, "id">) => void;
  removeLoreManualEdge: (campaignId: string, edgeId: string) => void;

  /** JSON всех кампаний для скачивания резервной копии. */
  exportBackupJson: () => string;
  /** Импорт из полной резервной копии или одной кампании (формат см. parseBackupJson). */
  importBackupJson: (json: string, mode: "merge" | "replace") =>
    | { ok: true; imported: number }
    | { ok: false; error: string };
  exportCampaignJson: (campaignId: string) => string | null;
};

export const useForgeStore = create<ForgeState>()(
  persist(
    (set, get) => ({
      campaigns: [],

      createCampaign: (title) => {
        const camp = defaultCampaign(title.trim() || "Новая кампания");
        set((s) => ({ campaigns: [camp, ...s.campaigns] }));
        return camp.id;
      },

      deleteCampaign: (id) => set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) })),

      updateCampaignMeta: (id, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? touch({ ...c, ...patch }) : c)),
        })),

      patchCampaignModules: (campaignId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, modules: applyForgeModulesPatch(c.modules, patch) }),
          ),
        })),

      addTimelineEntry: (campaignId, payload) => {
        const entry = {
          ...payload,
          id: newId(),
          createdAt: nowIso(),
        };
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({
                  ...c,
                  timeline: [entry, ...c.timeline],
                }),
          ),
        }));
      },

      updateTimelineEntry: (campaignId, entryId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({
                  ...c,
                  timeline: c.timeline.map((e) => (e.id !== entryId ? e : { ...e, ...patch })),
                }),
          ),
        })),

      removeTimelineEntry: (campaignId, entryId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, timeline: c.timeline.filter((e) => e.id !== entryId) }),
          ),
        })),

      addFaction: (campaignId, payload) => {
        const f = { ...payload, id: newId() };
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id !== campaignId ? c : touch({ ...c, factions: [f, ...c.factions] }))),
        }));
      },

      updateFaction: (campaignId, factionId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, factions: c.factions.map((f) => (f.id !== factionId ? f : { ...f, ...patch })) }),
          ),
        })),

      removeFaction: (campaignId, factionId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, factions: c.factions.filter((f) => f.id !== factionId) }),
          ),
        })),

      addLocation: (campaignId, payload) => {
        const loc = { ...payload, id: newId() };
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id !== campaignId ? c : touch({ ...c, locations: [loc, ...c.locations] }))),
        }));
      },

      updateLocation: (campaignId, locId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, locations: c.locations.map((l) => (l.id !== locId ? l : { ...l, ...patch })) }),
          ),
        })),

      removeLocation: (campaignId, locId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, locations: c.locations.filter((l) => l.id !== locId) }),
          ),
        })),

      addCharacter: (campaignId, payload) => {
        const ch = { ...payload, id: newId() };
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, characters: [ch, ...c.characters] }),
          ),
        }));
      },

      updateCharacter: (campaignId, charId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, characters: c.characters.map((x) => (x.id !== charId ? x : { ...x, ...patch })) }),
          ),
        })),

      removeCharacter: (campaignId, charId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, characters: c.characters.filter((x) => x.id !== charId) }),
          ),
        })),

      addQuest: (campaignId, payload) => {
        const q = { ...payload, id: newId() };
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id !== campaignId ? c : touch({ ...c, quests: [q, ...c.quests] }))),
        }));
      },

      updateQuest: (campaignId, questId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, quests: c.quests.map((q) => (q.id !== questId ? q : { ...q, ...patch })) }),
          ),
        })),

      removeQuest: (campaignId, questId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, quests: c.quests.filter((q) => q.id !== questId) }),
          ),
        })),

      addSessionLog: (campaignId, payload) => {
        const log = { ...payload, id: newId() };
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, sessionLogs: [log, ...c.sessionLogs] }),
          ),
        }));
      },

      updateSessionLog: (campaignId, logId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, sessionLogs: c.sessionLogs.map((l) => (l.id !== logId ? l : { ...l, ...patch })) }),
          ),
        })),

      removeSessionLog: (campaignId, logId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, sessionLogs: c.sessionLogs.filter((l) => l.id !== logId) }),
          ),
        })),

      addGalleryItem: (campaignId, payload) => {
        const it = { ...payload, id: newId() };
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id !== campaignId ? c : touch({ ...c, gallery: [it, ...c.gallery] }))),
        }));
      },

      updateGalleryItem: (campaignId, itemId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, gallery: c.gallery.map((g) => (g.id !== itemId ? g : { ...g, ...patch })) }),
          ),
        })),

      removeGalleryItem: (campaignId, itemId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, gallery: c.gallery.filter((g) => g.id !== itemId) }),
          ),
        })),

      patchSessionState: (campaignId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => {
            if (c.id !== campaignId) return c;
            const base = c.session ?? defaultSession();
            return touch({ ...c, session: { ...base, ...patch } });
          }),
        })),

      appendDiceRoll: (campaignId, roll) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => {
            if (c.id !== campaignId) return c;
            const base = c.session ?? defaultSession();
            const entry: DiceRollEntry = {
              id: newId(),
              rolledAt: roll.rolledAt || nowIso(),
              label: roll.label,
              formula: roll.formula,
              detail: roll.detail,
              total: roll.total,
            };
            const next = [...(base.diceLog ?? []), entry].slice(-120);
            return touch({ ...c, session: { ...base, diceLog: next } });
          }),
        })),

      clearDiceLog: (campaignId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, session: { ...(c.session ?? defaultSession()), diceLog: [] } }),
          ),
        })),

      reorderCombatants: (campaignId, idsInOrder) => {
        const { campaigns } = get();
        const c = campaigns.find((x) => x.id === campaignId);
        if (!c) return;
        const base = c.session ?? defaultSession();
        const map = new Map((base.combatants ?? []).map((x) => [x.id, x]));
        const next = idsInOrder.map((id) => map.get(id)).filter(Boolean) as Combatant[];
        set((s) => ({
          campaigns: s.campaigns.map((x) => {
            if (x.id !== campaignId) return x;
            const sess = x.session ?? defaultSession();
            return touch({ ...x, session: { ...sess, combatants: next } });
          }),
        }));
      },

      patchBattleMap: (campaignId, patchIn) =>
        set((s) => {
          const patch = { ...patchIn };
          if (typeof patch.backgroundUrl === "string") {
            const u = patch.backgroundUrl.trim();
            /** data:-URL могут быть мегабайтами и ломают persisted state в localStorage */
            if (u.startsWith("data:")) patch.backgroundUrl = "";
          }
          return {
            campaigns: s.campaigns.map((c) => {
              if (c.id !== campaignId) return c;
              const base = c.map ?? defaultBattleMap();
              return touch({ ...c, map: { ...base, ...patch } });
            }),
          };
        }),

      patchCampaignWritings: (campaignId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({
                  ...c,
                  houserulesMarkdown:
                    patch.houserulesMarkdown !== undefined ? patch.houserulesMarkdown : c.houserulesMarkdown,
                  lootAndRewardsLog:
                    patch.lootAndRewardsLog !== undefined ? patch.lootAndRewardsLog : c.lootAndRewardsLog,
                  horrorToolkit:
                    patch.horrorToolkit !== undefined
                      ? { ...(c.horrorToolkit ?? horrorDefaults()), ...patch.horrorToolkit }
                      : (c.horrorToolkit ?? horrorDefaults()),
                }),
          ),
        })),

      addWikiArticle: (campaignId, payload) => {
        const t = nowIso();
        const slugBase = slugifyWikiTitle(payload.slug?.trim() || payload.title.trim());
        set((s) => ({
          campaigns: s.campaigns.map((c) => {
            if (c.id !== campaignId) return c;
            const wiki = c.wikiArticles ?? [];
            let slug = slugBase;
            let n = 1;
            while (wiki.some((w) => w.slug === slug)) {
              slug = `${slugBase}-${n++}`;
            }
            const a: WikiArticle = {
              id: newId(),
              slug,
              title: payload.title.trim() || slug,
              category: payload.category,
              body: payload.body,
              ...(payload.srdRef ? { srdRef: payload.srdRef } : {}),
              createdAt: t,
              updatedAt: t,
            };
            return touch({ ...c, wikiArticles: [a, ...wiki] });
          }),
        }));
      },

      updateWikiArticle: (campaignId, articleId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({
                  ...c,
                  wikiArticles: (c.wikiArticles ?? []).map((w) =>
                    w.id !== articleId
                      ? w
                      : { ...w, ...patch, updatedAt: nowIso(), slug: patch.slug?.trim() || w.slug, title: patch.title?.trim() || w.title },
                  ),
                }),
          ),
        })),

      removeWikiArticle: (campaignId, articleId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, wikiArticles: (c.wikiArticles ?? []).filter((w) => w.id !== articleId) }),
          ),
        })),

      addSessionMeeting: (campaignId, payload) => {
        const t = nowIso();
        set((s) => ({
          campaigns: s.campaigns.map((c) => {
            if (c.id !== campaignId) return c;
            const plans = c.sessionPlans ?? [];
            const narrativeOrder =
              typeof payload.narrativeOrder === "number" ? payload.narrativeOrder : plans.length;
            const mt: SessionPlanMeeting = {
              id: newId(),
              title: payload.title.trim() || "Новый вечер игры",
              whenLabel: payload.whenLabel ?? "",
              narrativeOrder,
              blocks: (payload.blocks ?? []).map((b, i) => ({
                id: newId(),
                kind: b.kind,
                title: b.title,
                content: b.content,
                refId: b.refId,
                order: i,
              })),
              createdAt: t,
            };
            return touch({ ...c, sessionPlans: [...plans, mt].sort((a, b) => a.narrativeOrder - b.narrativeOrder) });
          }),
        }));
      },

      removeSessionMeeting: (campaignId, meetingId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, sessionPlans: (c.sessionPlans ?? []).filter((m) => m.id !== meetingId) }),
          ),
        })),

      updateSessionMeeting: (campaignId, meetingId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({
                  ...c,
                  sessionPlans: (c.sessionPlans ?? []).map((m) => (m.id !== meetingId ? m : { ...m, ...patch })),
                }),
          ),
        })),

      reorderSessionMeetings: (campaignId, meetingIdsOrdered) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => {
            if (c.id !== campaignId) return c;
            const map = new Map((c.sessionPlans ?? []).map((m) => [m.id, m]));
            const next = meetingIdsOrdered.map((id, narrativeOrder) => {
              const m = map.get(id);
              return m ? { ...m, narrativeOrder } : null;
            }).filter(Boolean) as SessionPlanMeeting[];
            const rest = (c.sessionPlans ?? []).filter((m) => !meetingIdsOrdered.includes(m.id));
            return touch({ ...c, sessionPlans: [...next, ...rest].sort((a, b) => a.narrativeOrder - b.narrativeOrder) });
          }),
        })),

      addSessionBlock: (campaignId, meetingId, payload) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => {
            if (c.id !== campaignId) return c;
            return touch({
              ...c,
              sessionPlans: (c.sessionPlans ?? []).map((m) => {
                if (m.id !== meetingId) return m;
                const ord = Math.max(...m.blocks.map((b) => b.order), -1) + 1;
                const blk: SessionPlanBlock = {
                  id: newId(),
                  title: payload.title,
                  kind: payload.kind,
                  content: payload.content,
                  refId: payload.refId,
                  order: ord,
                };
                return { ...m, blocks: [...m.blocks, blk] };
              }),
            });
          }),
        })),

      updateSessionBlock: (campaignId, meetingId, blockId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => {
            if (c.id !== campaignId) return c;
            return touch({
              ...c,
              sessionPlans: (c.sessionPlans ?? []).map((m) =>
                m.id !== meetingId
                  ? m
                  : { ...m, blocks: m.blocks.map((b) => (b.id !== blockId ? b : { ...b, ...patch })) },
              ),
            });
          }),
        })),

      removeSessionBlock: (campaignId, meetingId, blockId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => {
            if (c.id !== campaignId) return c;
            return touch({
              ...c,
              sessionPlans: (c.sessionPlans ?? []).map((m) =>
                m.id !== meetingId ? m : { ...m, blocks: m.blocks.filter((b) => b.id !== blockId) },
              ),
            });
          }),
        })),

      reorderSessionBlocks: (campaignId, meetingId, blockIdsOrdered) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => {
            if (c.id !== campaignId) return c;
            return touch({
              ...c,
              sessionPlans: (c.sessionPlans ?? []).map((m) => {
                if (m.id !== meetingId) return m;
                const map = new Map(m.blocks.map((b) => [b.id, b]));
                const next = blockIdsOrdered.map((id, order) => {
                  const blk = map.get(id);
                  return blk ? { ...blk, order } : null;
                }).filter(Boolean) as SessionPlanBlock[];
                const rest = m.blocks.filter((b) => !blockIdsOrdered.includes(b.id));
                return { ...m, blocks: [...next, ...rest].sort((a, b) => a.order - b.order) };
              }),
            });
          }),
        })),

      addMonsterBlock: (campaignId, payload) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, monsterBlocks: [{ ...payload, id: newId() }, ...(c.monsterBlocks ?? [])] }),
          ),
        })),

      updateMonsterBlock: (campaignId, monsterId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({
                  ...c,
                  monsterBlocks: (c.monsterBlocks ?? []).map((x) => (x.id !== monsterId ? x : { ...x, ...patch })),
                }),
          ),
        })),

      removeMonsterBlock: (campaignId, monsterId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, monsterBlocks: (c.monsterBlocks ?? []).filter((x) => x.id !== monsterId) }),
          ),
        })),

      addEncounterBuild: (campaignId, payload) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, encounters: [{ ...payload, id: newId(), monsterQuantities: payload.monsterQuantities ?? [] }, ...(c.encounters ?? [])] }),
          ),
        })),

      updateEncounterBuild: (campaignId, encounterId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, encounters: (c.encounters ?? []).map((x) => (x.id !== encounterId ? x : { ...x, ...patch })) }),
          ),
        })),

      removeEncounterBuild: (campaignId, encounterId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, encounters: (c.encounters ?? []).filter((x) => x.id !== encounterId) }),
          ),
        })),

      addQuickDrop: (campaignId, payload) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, quickDrops: [{ ...payload, id: newId() }, ...(c.quickDrops ?? [])] }),
          ),
        })),

      updateQuickDrop: (campaignId, dropId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, quickDrops: (c.quickDrops ?? []).map((d) => (d.id !== dropId ? d : { ...d, ...patch })) }),
          ),
        })),

      removeQuickDrop: (campaignId, dropId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, quickDrops: (c.quickDrops ?? []).filter((d) => d.id !== dropId) }),
          ),
        })),

      addLibraryDoc: (campaignId, payload) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, libraryDocs: [{ ...payload, id: newId(), tags: payload.tags ?? [] }, ...(c.libraryDocs ?? [])] }),
          ),
        })),

      updateLibraryDoc: (campaignId, docId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({
                  ...c,
                  libraryDocs: (c.libraryDocs ?? []).map((d) => (d.id !== docId ? d : { ...d, ...patch, tags: patch.tags ?? d.tags })),
                }),
          ),
        })),

      removeLibraryDoc: (campaignId, docId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId ? c : touch({ ...c, libraryDocs: (c.libraryDocs ?? []).filter((d) => d.id !== docId) }),
          ),
        })),

      addHomebrewRecord: (campaignId, payload) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, homebrewDefinitions: [{ ...payload, id: newId() }, ...(c.homebrewDefinitions ?? [])] }),
          ),
        })),

      updateHomebrewRecord: (campaignId, recordId, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, homebrewDefinitions: (c.homebrewDefinitions ?? []).map((r) => (r.id !== recordId ? r : { ...r, ...patch })) }),
          ),
        })),

      removeHomebrewRecord: (campaignId, recordId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, homebrewDefinitions: (c.homebrewDefinitions ?? []).filter((r) => r.id !== recordId) }),
          ),
        })),

      addLoreManualEdge: (campaignId, payload) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, loreGraphExtras: [{ ...payload, id: newId() }, ...(c.loreGraphExtras ?? [])] }),
          ),
        })),

      removeLoreManualEdge: (campaignId, edgeId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : touch({ ...c, loreGraphExtras: (c.loreGraphExtras ?? []).filter((e) => e.id !== edgeId) }),
          ),
        })),

      exportBackupJson: () => {
        const { campaigns } = get();
        return JSON.stringify(
          {
            format: BACKUP_FORMAT,
            version: 2,
            exportedAt: nowIso(),
            campaigns,
          },
          null,
          2,
        );
      },

      exportCampaignJson: (campaignId) => {
        const c = get().campaigns.find((x) => x.id === campaignId);
        if (!c) return null;
        return JSON.stringify(
          {
            format: SINGLE_FORMAT,
            version: 2,
            exportedAt: nowIso(),
            campaign: c,
          },
          null,
          2,
        );
      },

      importBackupJson: (json, mode) => {
        const parsed = parseBackupJson(json);
        if (parsed.kind === "error") return { ok: false, error: parsed.message };

        if (parsed.kind === "single") {
          const c = touch(ensureImportedCampaign(parsed.data.campaign));
          set((s) => ({
            campaigns: [c, ...s.campaigns.filter((x) => x.id !== c.id)],
          }));
          return { ok: true, imported: 1 };
        }

        const list = parsed.data.campaigns.map((raw) => touch(ensureImportedCampaign(raw)));
        if (mode === "replace") {
          set({ campaigns: list });
          return { ok: true, imported: list.length };
        }
        set((s) => {
          const map = new Map(s.campaigns.map((c) => [c.id, c]));
          for (const c of list) {
            map.set(c.id, c);
          }
          return { campaigns: Array.from(map.values()) };
        });
        return { ok: true, imported: list.length };
      },
    }),
    {
      name: FORGE_LS_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: (persisted, version) => {
        type Slice = { campaigns: Campaign[] };
        const v = version ?? 0;
        let p = persisted as { campaigns?: Campaign[] } | unknown;
        if (!p || typeof p !== "object" || !Array.isArray((p as { campaigns?: unknown }).campaigns)) {
          return { campaigns: [] } as Slice;
        }
        let campaigns = (p as Slice).campaigns.slice();
        if (v < 2) {
          campaigns = campaigns.map((c) => {
            const sess = c.session ?? defaultSession();
            return {
              ...c,
              session: {
                ...sess,
                diceLog: sess.diceLog ?? [],
              },
            };
          });
        }
        campaigns = campaigns.map((raw) => ensureImportedCampaign(raw as Campaign));
        return { campaigns };
      },
      partialize: (state) => ({ campaigns: state.campaigns }),
    },
  ),
);
