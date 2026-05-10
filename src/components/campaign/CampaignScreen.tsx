"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FORGE_MODULE_IDS, FORGE_MODULE_LABELS, mergeForgeModules, type ForgeModuleId } from "@/domain/forgeModules";
import type { LocationNode } from "@/domain/types";
import { AppShell } from "@/components/AppShell";
import {
  CharactersPanel,
  FactionsPanel,
  GalleryPanel,
  LocationsPanel,
  LogsPanel,
  QuestsPanel,
  TimelinePanel,
} from "@/components/campaign/campaignPanels";
import { EncounterLabPanel } from "@/components/campaign/extended/EncounterLabPanel";
import { LoreGraphCampaignPanel } from "@/components/campaign/extended/LoreGraphCampaignPanel";
import { PartyBenchPanel } from "@/components/campaign/extended/PartyBenchPanel";
import { SessionPrepPanel } from "@/components/campaign/extended/SessionPrepPanel";
import { downloadTextFile } from "@/lib/campaignBackup";
import { useForgeStore } from "@/store/useForgeStore";

type TabKey =
  | "overview"
  | "lore_web"
  | "session_prep"
  | "encounters"
  | "party"
  /** Таймлайн + лог встреч одной вкладкой (модули включаются раздельно в обзоре). */
  | "journal"
  | "factions"
  | "locations"
  | "characters"
  | "quests"
  | "gallery";

/** Какую вкладку выключают «жёсткие модули». */
const TAB_MODULE: Partial<Record<TabKey, ForgeModuleId>> = {
  lore_web: "loreGraph",
  session_prep: "sessionPlanner",
  encounters: "encounterLab",
  party: "partyLibrary",
  factions: "factions",
  locations: "locations",
  characters: "characters",
  quests: "quests",
  gallery: "gallery",
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Обзор" },
  { key: "lore_web", label: "Граф связей" },
  { key: "session_prep", label: "Планы игр" },
  { key: "encounters", label: "Столкновения" },
  { key: "party", label: "Партия" },
  { key: "journal", label: "Хроника" },
  { key: "factions", label: "Фракции" },
  { key: "locations", label: "Локации" },
  { key: "characters", label: "Персонажи" },
  { key: "quests", label: "Квесты" },
  { key: "gallery", label: "Галерея" },
];

function locationDepth(loc: LocationNode, all: LocationNode[]): number {
  let depth = 0;
  let cur: LocationNode | undefined = loc;
  const guard = new Set<string>();
  for (;;) {
    if (!cur?.parentId || guard.has(cur.id) || depth > 50) break;
    guard.add(cur.id);
    depth += 1;
    const parentId: string | null | undefined = cur.parentId;
    cur = parentId ? all.find((x) => x.id === parentId) : undefined;
  }
  return depth;
}

export function CampaignScreen({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const campaign = useForgeStore((s) => s.campaigns.find((c) => c.id === campaignId) ?? null);

  const updateMeta = useForgeStore((s) => s.updateCampaignMeta);
  const deleteCampaign = useForgeStore((s) => s.deleteCampaign);

  const addTimeline = useForgeStore((s) => s.addTimelineEntry);
  const updateTimelineEntry = useForgeStore((s) => s.updateTimelineEntry);
  const removeTimeline = useForgeStore((s) => s.removeTimelineEntry);

  const addFaction = useForgeStore((s) => s.addFaction);
  const updateFaction = useForgeStore((s) => s.updateFaction);
  const removeFaction = useForgeStore((s) => s.removeFaction);

  const addLocation = useForgeStore((s) => s.addLocation);
  const updateLocation = useForgeStore((s) => s.updateLocation);
  const removeLocation = useForgeStore((s) => s.removeLocation);

  const addCharacter = useForgeStore((s) => s.addCharacter);
  const updateCharacter = useForgeStore((s) => s.updateCharacter);
  const removeCharacter = useForgeStore((s) => s.removeCharacter);

  const addQuest = useForgeStore((s) => s.addQuest);
  const updateQuest = useForgeStore((s) => s.updateQuest);
  const removeQuest = useForgeStore((s) => s.removeQuest);

  const addLog = useForgeStore((s) => s.addSessionLog);
  const updateSessionLog = useForgeStore((s) => s.updateSessionLog);
  const removeLog = useForgeStore((s) => s.removeSessionLog);

  const addGallery = useForgeStore((s) => s.addGalleryItem);
  const updateGalleryItem = useForgeStore((s) => s.updateGalleryItem);
  const removeGallery = useForgeStore((s) => s.removeGalleryItem);

  const exportCampaignJson = useForgeStore((s) => s.exportCampaignJson);
  const patchCampaignModules = useForgeStore((s) => s.patchCampaignModules);

  const [tab, setTab] = useState<TabKey>("overview");

  const safeCamp = useMemo(() => {
    if (!campaign) return null;
    return {
      ...campaign,
      modules: mergeForgeModules(campaign.modules),
      tags: campaign.tags ?? [],
      gallery: campaign.gallery ?? [],
      session: campaign.session,
      map: campaign.map,
    };
  }, [campaign]);

  const visibleTabs = useMemo(() => {
    if (!safeCamp) return TABS;
    const m = safeCamp.modules;
    return TABS.filter((t) => {
      if (t.key === "journal") return m.timeline !== false || m.sessionLogs !== false;
      const mod = TAB_MODULE[t.key];
      if (!mod) return true;
      return m[mod] !== false;
    });
  }, [safeCamp]);

  const snapshot = useMemo(() => {
    if (!safeCamp) return null;
    const plans = safeCamp.sessionPlans ?? [];
    const nextPlan = plans.slice().sort((a, b) => a.narrativeOrder - b.narrativeOrder)[0];
    return {
      locations: safeCamp.locations?.length ?? 0,
      characters: safeCamp.characters?.length ?? 0,
      pcs: (safeCamp.characters ?? []).filter((c) => c.kind === "pc").length,
      quests: safeCamp.quests?.length ?? 0,
      factions: safeCamp.factions?.length ?? 0,
      monsters: safeCamp.monsterBlocks?.length ?? 0,
      encounters: safeCamp.encounters?.length ?? 0,
      drops: safeCamp.quickDrops?.length ?? 0,
      plans: plans.length,
      nextPlanTitle: nextPlan?.title ?? null,
    };
  }, [safeCamp]);

  useEffect(() => {
    if (!safeCamp) return;
    const m = safeCamp.modules;
    if (tab === "journal" && m.timeline === false && m.sessionLogs === false) setTab("overview");
    const mod = TAB_MODULE[tab];
    if (mod && m[mod] === false) setTab("overview");
  }, [tab, safeCamp]);

  const [metaDraft, setMetaDraft] = useState({
    title: "",
    system: "",
    partyLevel: 3,
    tone: "",
    tags: [] as string[],
  });

  useEffect(() => {
    if (!campaign) return;
    setMetaDraft({
      title: campaign.title,
      system: campaign.system,
      partyLevel: campaign.partyLevel,
      tone: campaign.tone,
      tags: campaign.tags ?? [],
    });
  }, [campaign, campaign?.id, campaign?.updatedAt]);

  if (!safeCamp) {
    return (
      <AppShell title="Кампания не найдена" kicker="404" breadcrumb={[{ href: "/campaigns", label: "Все кампании" }]}>
        <div className="forge-sheet p-6">
          <p className="text-sm forge-text-soft">Возможно, ссылка устарела или данные браузера очищались без импорта JSON.</p>
          <Link className="forge-btn-gold mt-4 inline-flex" href="/campaigns">
            Открыть список кампаний
          </Link>
        </div>
      </AppShell>
    );
  }

  function saveMeta() {
    updateMeta(campaignId, {
      title: metaDraft.title.trim(),
      system: metaDraft.system.trim(),
      partyLevel: Number.isFinite(metaDraft.partyLevel)
        ? Math.max(1, Math.min(20, Math.round(metaDraft.partyLevel)))
        : 3,
      tone: metaDraft.tone.trim(),
      tags: metaDraft.tags,
    });
  }

  return (
    <AppShell
      title={safeCamp.title}
      kicker="Кампания"
      subtitle="Сверху — быстрый стол. Ниже вкладки: мир и подготовка. Правила (SRD) только в меню «Справка», без правок в кампании."
      breadcrumb={[{ href: "/campaigns", label: "Все кампании" }]}
    >
      <div className="flex flex-col gap-5">
        <section className="forge-sheet p-5 md:p-6" aria-labelledby="campaign-table-heading">
          <h2 id="campaign-table-heading" className="forge-label">
            На игровом столе (во время партии)
          </h2>
          <p className="forge-muted mt-3 max-w-2xl text-[13px] leading-relaxed">
            Во время игры: таймер, инициатива и броски — в сессии. Карта города (Watabou) — на отдельной странице, настройки города сохраняются в кампании.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`/session/${campaignId}`} className="forge-btn-gold">
              Сессия
            </Link>
            <Link href={`/maps/${campaignId}`} className="forge-btn-wood">
              Карта города
            </Link>
          </div>
          <hr className="forge-divider" />
          <h2 className="forge-label mt-6">Расчёты и генераторы</h2>
          <p className="forge-muted mt-3 max-w-2xl text-[13px] leading-relaxed">
            Кубики, сложность боя, добыча — в «За столом». Генераторы NPC и событий — в «Генераторы».
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`/generators/npc?campaign=${campaignId}`} className="forge-btn-outline-ondark">
              Сгенерировать NPC → в кампанию
            </Link>
            <Link href="/tools" className="forge-btn-outline-ondark">
              Кубики и встреча по XP
            </Link>
            <Link href="/reference" className="forge-btn-outline-ondark">
              Шпаргалка мастера
            </Link>
          </div>
          <hr className="forge-divider" />
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-t border-dotted border-[var(--tt-line)] pt-6">
            <div className="min-w-0 max-w-xl">
              <p className="forge-label">Удалить кампанию навсегда</p>
              <p className="forge-muted mt-2 text-[12px] leading-relaxed">
                Из браузера запись пропадает навсегда. Перед экспериментами сделайте JSON-бэкап разделом выше («Экспорт» в обзоре) или со страницы «Все кампании».
              </p>
            </div>
            <button
              type="button"
              className="forge-btn-danger shrink-0 self-center normal-case tracking-normal"
              onClick={() => {
                if (
                  confirm(
                    "Удалить эту кампанию навсегда? Нельзя восстановить, если не сохранён JSON-бэкап.",
                  )
                ) {
                  deleteCampaign(campaignId);
                  router.push("/campaigns");
                }
              }}
            >
              Удалить безвозвратно…
            </button>
          </div>
        </section>

        <section className="forge-sheet px-4 py-4 md:px-6 md:py-5" aria-labelledby="campaign-notes-heading">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="campaign-notes-heading" className="forge-label">
                Вкладки кампании
              </h2>
              <p className="forge-muted mt-2 max-w-2xl text-[13px] leading-relaxed">
                Локально в браузере. Лишние блоки можно скрыть в обзоре («жёсткие модули»). Справка по SRD — пункт «Справка» в шапке.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Разделы карточки кампании">
            {visibleTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={tab === t.key ? "forge-tab forge-tab-active" : "forge-tab"}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {tab === "overview" && (
          <section className="forge-sheet p-6">
            {snapshot && (
              <div className="mb-10 border-b border-dotted border-[var(--tt-line)] pb-10">
                <h2 className="forge-label mb-4">Снимок кампании</h2>
                <p className="mb-5 max-w-2xl text-[13px] leading-relaxed forge-muted">
                  Цифры обновляются сами по спискам ниже. Удобно понять, насколько «набита» карточка, не открывая каждую вкладку.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Локации", snapshot.locations],
                    ["Персонажи", `${snapshot.characters} (PC ${snapshot.pcs})`],
                    ["Квесты", snapshot.quests],
                    ["Фракции", snapshot.factions],
                    ["Статблоки", snapshot.monsters],
                    ["Наборы боя", snapshot.encounters],
                    ["Дроп-сцены", snapshot.drops],
                    ["Планы вечеров", snapshot.plans],
                  ].map(([label, val]) => (
                    <div key={String(label)} className="forge-inset flex flex-col justify-center px-4 py-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] forge-muted">{label}</span>
                      <span className="mt-1 text-lg font-semibold text-[var(--tt-fg)]">{val}</span>
                    </div>
                  ))}
                </div>
                {snapshot.nextPlanTitle ? (
                  <p className="mt-5 text-[12px] forge-text-soft">
                    Следующий по порядку план вечера: <strong className="text-[var(--tt-fg)]">{snapshot.nextPlanTitle}</strong> (вкладка «Планы игр»).
                  </p>
                ) : (
                  <p className="mt-5 text-[12px] forge-muted">Пока нет планов вечеров — создайте во вкладке «Планы игр».</p>
                )}
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="forge-inset p-4 text-[13px] leading-relaxed forge-text-soft">
                    <p className="forge-label mb-2">Куда зачем</p>
                    <ul className="list-disc space-y-2 pl-5">
                      <li>
                        <strong className="text-[var(--tt-fg)]">Планы игр</strong> — сцены и заметки на встречу.
                      </li>
                      <li>
                        <strong className="text-[var(--tt-fg)]">Столкновения</strong> — монстры под расчёт сложности.
                      </li>
                      <li>
                        <strong className="text-[var(--tt-fg)]">Партия</strong> — хиты PC, порча/лут, формулировка спасброска для озвучки.
                      </li>
                      <li>
                        <strong className="text-[var(--tt-fg)]">Хроника</strong> — сюжетный таймлайн и краткий лог прошлых игр рядом.
                      </li>
                      <li>
                        <strong className="text-[var(--tt-fg)]">Справка</strong> (меню вверху) — только чтение по SRD.
                      </li>
                    </ul>
                  </div>
                  <div className="forge-inset p-4 text-[13px] leading-relaxed forge-text-soft">
                    <p className="forge-label mb-2">Стол</p>
                    <p>
                      Карта поселения сохранена в кампании: после правок параметров города они останутся при следующем открытии страницы «Карта города» со страницы кампании или сессии.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/maps/${campaignId}`} className="forge-btn-outline text-[11px] normal-case">
                        Открыть карту города
                      </Link>
                      <Link href="/lore" className="forge-btn-outline text-[11px] normal-case">
                        Справка SRD
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h2 className="text-lg font-semibold">Название и теги</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="forge-label">Название</span>
                <input
                  className="forge-field mt-2"
                  value={metaDraft.title}
                  onChange={(e) => setMetaDraft((d) => ({ ...d, title: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                <span className="forge-label">Система</span>
                <input
                  className="forge-field mt-2"
                  value={metaDraft.system}
                  onChange={(e) => setMetaDraft((d) => ({ ...d, system: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                <span className="forge-label">Уровень партии</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="forge-field mt-2"
                  value={metaDraft.partyLevel}
                  onChange={(e) => setMetaDraft((d) => ({ ...d, partyLevel: Number(e.target.value) }))}
                />
              </label>
              <label className="block text-sm md:col-span-2">
                <span className="forge-label">Тон</span>
                <input
                  className="forge-field mt-2"
                  value={metaDraft.tone}
                  onChange={(e) => setMetaDraft((d) => ({ ...d, tone: e.target.value }))}
                />
              </label>
              <label className="block text-sm md:col-span-2">
                <span className="forge-label">Теги через запятую</span>
                <input
                  className="forge-field mt-2"
                  value={metaDraft.tags.join(", ")}
                  onChange={(e) =>
                    setMetaDraft((d) => ({
                      ...d,
                      tags: e.target.value
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </label>
            </div>
            <div className="mt-10 border-t border-dotted border-[var(--tt-line-strong)] pt-6">
              <h3 className="forge-label">Что показывать во вкладках</h3>
              <p className="forge-muted mt-2 max-w-2xl text-[12px] leading-relaxed">
                Выключено — вкладка прячется (для простого стола без графов и т.д.). «Хроника» видна, если включен хотя бы таймлайн или лог встреч.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {FORGE_MODULE_IDS.map((mid) => (
                  <label key={mid} className="flex cursor-pointer gap-3 text-[13px] forge-text-soft">
                    <input
                      type="checkbox"
                      checked={safeCamp.modules[mid]}
                      onChange={(e) => patchCampaignModules(campaignId, { [mid]: e.target.checked })}
                    />
                    <span>{FORGE_MODULE_LABELS[mid]}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="forge-btn-gold" onClick={saveMeta}>
                Сохранить метаданные
              </button>
              <button
                type="button"
                className="forge-btn-outline"
                onClick={() =>
                  setMetaDraft({
                    title: safeCamp.title,
                    system: safeCamp.system,
                    partyLevel: safeCamp.partyLevel,
                    tone: safeCamp.tone,
                    tags: safeCamp.tags,
                  })
                }
              >
                Сбросить черновик
              </button>
              <button
                type="button"
                className="forge-btn-outline"
                onClick={() => {
                  const j = exportCampaignJson(campaignId);
                  if (!j) return;
                  const fname = `${safeCamp.title.replace(/[^\w\s\-]+/g, "").trim().replace(/\s+/g, "-") || "campaign"}-${campaignId.slice(0, 8)}.json`;
                  downloadTextFile(fname, j);
                }}
              >
                Экспорт JSON этой кампании
              </button>
              <Link href="/campaigns#campaign-import" className="forge-btn-outline inline-flex items-center">
                Импорт на хабе кампаний
              </Link>
            </div>
            <p className="mt-4 text-xs forge-muted leading-relaxed">
              JSON включает сессию, карту города, кубики, списки мира и т.д. Импорт — со страницы «Все кампании».
            </p>
          </section>
        )}

        {tab === "lore_web" && (
          <section className="forge-sheet p-6">
            <LoreGraphCampaignPanel campaignId={campaignId} />
          </section>
        )}

        {tab === "session_prep" && (
          <section className="forge-sheet p-6">
            <SessionPrepPanel campaignId={campaignId} />
          </section>
        )}

        {tab === "encounters" && (
          <section className="forge-sheet p-6">
            <EncounterLabPanel campaignId={campaignId} />
          </section>
        )}

        {tab === "party" && (
          <section className="forge-sheet p-6">
            <PartyBenchPanel campaignId={campaignId} />
          </section>
        )}

        {tab === "journal" && (
          <section className="forge-sheet space-y-12 p-6">
            {safeCamp.modules.timeline !== false && (
              <div>
                <h2 className="forge-label mb-4">Сюжетный таймлайн</h2>
                <TimelinePanel
                  entries={safeCamp.timeline}
                  add={(payload) => addTimeline(campaignId, payload)}
                  update={(entryId, patch) => updateTimelineEntry(campaignId, entryId, patch)}
                  remove={(id) => removeTimeline(campaignId, id)}
                />
              </div>
            )}
            {safeCamp.modules.sessionLogs !== false && (
              <div>
                <h2 className="forge-label mb-4">Лог прошлых встреч</h2>
                <LogsPanel campaignId={campaignId} items={safeCamp.sessionLogs} add={addLog} update={updateSessionLog} remove={removeLog} />
              </div>
            )}
          </section>
        )}

        {tab === "factions" && (
          <section className="forge-sheet p-6">
            <FactionsPanel campaignId={campaignId} items={safeCamp.factions} add={addFaction} update={updateFaction} remove={removeFaction} />
          </section>
        )}

        {tab === "locations" && (
          <section className="forge-sheet p-6">
            <LocationsPanel
              campaignId={campaignId}
              items={safeCamp.locations}
              add={(payload) => addLocation(campaignId, payload)}
              update={(locId, patch) => updateLocation(campaignId, locId, patch)}
              remove={(id) => removeLocation(campaignId, id)}
              depth={locationDepth}
            />
          </section>
        )}

        {tab === "characters" && (
          <section className="forge-sheet p-6">
            <CharactersPanel campaignId={campaignId} items={safeCamp.characters} add={addCharacter} update={updateCharacter} remove={removeCharacter} />
          </section>
        )}

        {tab === "quests" && (
          <section className="forge-sheet p-6">
            <QuestsPanel
              campaignId={campaignId}
              items={safeCamp.quests}
              add={(payload) => addQuest(campaignId, payload)}
              update={(id, patch) => updateQuest(campaignId, id, patch)}
              remove={(id) => removeQuest(campaignId, id)}
            />
          </section>
        )}

        {tab === "gallery" && (
          <section className="forge-sheet p-6">
            <GalleryPanel campaignId={campaignId} items={safeCamp.gallery} add={addGallery} update={updateGalleryItem} remove={removeGallery} />
          </section>
        )}

      </div>
    </AppShell>
  );
}
