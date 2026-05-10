"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSrdMonsterByKey, SRD_MONSTERS } from "@/data/srd/monsters";
import type { Campaign, EncounterBuild } from "@/domain/types";
import { encounterSummary } from "@/lib/encounter5e";
import { srdMonsterToStatblockPartial } from "@/lib/srdCatalog";
import { useForgeStore } from "@/store/useForgeStore";

export function EncounterLabPanel({ campaignId }: { campaignId: string }) {
  const campaign = useForgeStore((s) => s.campaigns.find((c) => c.id === campaignId) ?? null);
  const addMb = useForgeStore((s) => s.addMonsterBlock);
  const updateMb = useForgeStore((s) => s.updateMonsterBlock);
  const removeMb = useForgeStore((s) => s.removeMonsterBlock);
  const addEc = useForgeStore((s) => s.addEncounterBuild);
  const updateEc = useForgeStore((s) => s.updateEncounterBuild);
  const removeEc = useForgeStore((s) => s.removeEncounterBuild);

  const [partySizeDraft, setPartySizeDraft] = useState<number>(4);
  const [encPick, setEncPick] = useState("");

  const encList = campaign?.encounters ?? [];
  const encSel = encList.find((e) => e.id === encPick) ?? encList[0];

  useEffect(() => {
    const first = encList[0]?.id;
    if (!first) {
      setEncPick("");
      return;
    }
    setEncPick((prev) => (prev && encList.some((x) => x.id === prev) ? prev : first));
  }, [encList]);

  const tierRu: Record<string, string> = {
    trivial: "Лёгкая разминка",
    easy: "Лёгкая",
    medium: "Средняя",
    hard: "Тяжёлая",
    deadly: "Смертельная",
    over: "Сильнее порога",
  };

  const summaryForEncounter = useMemo(() => {
    if (!campaign || !encSel) return null;
    const crs: string[] = [];
    for (const row of encSel.monsterQuantities ?? []) {
      const m = campaign.monsterBlocks?.find((x) => x.id === row.monsterId);
      if (!m) continue;
      const n = Math.max(1, row.count);
      for (let i = 0; i < n; i += 1) crs.push(String(m.cr).trim());
    }
    if (!crs.length) return null;
    return encounterSummary({
      partyLevel: campaign.partyLevel,
      partySize: partySizeDraft,
      monsterCrs: crs,
    });
  }, [campaign, encSel, partySizeDraft]);

  if (!campaign) return <p className="forge-muted">Нет кампании.</p>;

  return (
    <div className="space-y-8">
      <div className="forge-inset text-[12px] leading-relaxed forge-muted">
        Каталог монстров — только <strong>Open Game License / SRD 5e</strong>. Полный список и справочный текст — в меню «Справка». Карточку можно править вручную после подстановки.
      </div>

      <section className="forge-inset space-y-4 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="forge-label">Монстр — карточка на лету</p>
            <p className="forge-muted mt-2 text-[12px]">CR указывайте как в книге («1/4», «2»…).</p>
          </div>
          <button
            type="button"
            className="forge-btn-gold text-[11px]"
            onClick={() =>
              addMb(campaignId, {
                name: "Черновик существа",
                cr: "1",
                ac: 12,
                hpAverage: 20,
                speed: "30 фт.",
                statsNote: "Краткие атаки / способности сюда своими словами",
                extra: "",
                sourceTag: "homebrew",
              })
            }
          >
            Новый статблок
          </button>
        </div>
        {(campaign.monsterBlocks ?? []).map((m) => (
          <div key={m.id} className="border border-dotted border-[var(--tt-line-strong)] bg-[var(--tt-bg)] p-4 font-mono text-[11px]">
            <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
              <label className="min-w-[12rem] max-w-xl flex-1 text-[10px] uppercase tracking-[0.12em] forge-muted">
                Каталог SRD
                <select
                  key={`srd-pick-${m.id}-${m.srdCatalogKey ?? "none"}`}
                  defaultValue=""
                  className="forge-field mt-2 w-full px-3 py-2 normal-case tracking-normal"
                  onChange={(e) => {
                    const key = e.target.value;
                    if (!key) return;
                    const row = getSrdMonsterByKey(key);
                    if (!row) return;
                    updateMb(campaignId, m.id, srdMonsterToStatblockPartial(row));
                  }}
                >
                  <option value="">— напрямую из набора Open Content —</option>
                  {SRD_MONSTERS.map((row) => (
                    <option key={row.key} value={row.key}>
                      {row.nameEn} (CR {row.cr})
                    </option>
                  ))}
                </select>
              </label>
              {(m.srdCatalogKey || m.linkedWikiArticleId) && (
                <p className="w-full text-[10px] forge-muted">
                  Источник: {m.srdCatalogKey ? `SRD ${m.srdCatalogKey}` : "SRD"}
                  {m.linkedWikiArticleId ? " (старая привязка к статье)" : ""}
                </p>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="md:col-span-3">
                <span className="forge-label normal-case tracking-normal text-[var(--tt-fg)]">{m.name}</span>
                <input value={m.name} onChange={(e) => updateMb(campaignId, m.id, { name: e.target.value })} className="forge-field mt-2" />
              </label>
              <label>
                CR
                <input value={m.cr} onChange={(e) => updateMb(campaignId, m.id, { cr: e.target.value })} className="forge-field mt-2" />
              </label>
              <label>
                КД
                <input
                  type="number"
                  value={m.ac ?? ""}
                  onChange={(e) => updateMb(campaignId, m.id, { ac: Number(e.target.value) })}
                  className="forge-field mt-2"
                />
              </label>
              <label>
                Сред. HP
                <input
                  type="number"
                  value={m.hpAverage ?? ""}
                  onChange={(e) => updateMb(campaignId, m.id, { hpAverage: Number(e.target.value) })}
                  className="forge-field mt-2"
                />
              </label>
            </div>
            <label className="mt-3 block">
              Скорость / чувства
              <input value={m.speed ?? ""} onChange={(e) => updateMb(campaignId, m.id, { speed: e.target.value })} className="forge-field mt-2" />
            </label>
            <label className="mt-3 block">
              Краткая механика
              <textarea
                rows={3}
                value={m.statsNote ?? ""}
                onChange={(e) => updateMb(campaignId, m.id, { statsNote: e.target.value })}
                className="forge-field mt-2"
              />
            </label>
            <label className="mt-3 block">
              Легендарные / особые
              <textarea rows={2} value={m.extra ?? ""} onChange={(e) => updateMb(campaignId, m.id, { extra: e.target.value })} className="forge-field mt-2" />
            </label>
            <p className="forge-muted mt-2 text-[10px] uppercase">id: {m.id}</p>
            <button type="button" className="forge-muted mt-2 text-[11px] underline" onClick={() => removeMb(campaignId, m.id)}>
              удалить статблок
            </button>
          </div>
        ))}
      </section>

      <section className="forge-inset space-y-4 p-5">
        <p className="forge-label">Сохранённые столкновения</p>
        <p className="forge-muted text-[12px]">
          Связывайте ранее введённые карточки и мгновенно прикиньте сложность. Подстройка ресурсов группы («устали», «нет ячеек») — пока текстом во вкладке «Партия».
        </p>
        <button
          type="button"
          className="forge-btn-outline text-[11px]"
            onClick={() => {
            addEc(campaignId, {
              name: "Набор монстров для боя",
              monsterQuantities: [],
              notes: "",
            });
            queueMicrotask(() => {
              const neo = useForgeStore.getState().campaigns.find((c) => c.id === campaignId)?.encounters?.[0]?.id;
              if (neo) setEncPick(neo);
            });
          }}
        >
          Новый набор столкновения
        </button>
        {(campaign.encounters ?? []).map((enc) => (
          <div key={enc.id} className="border border-dotted border-[var(--tt-line)] p-4">
            <label className="block text-sm">
              <span className="forge-label">Название</span>
              <input value={enc.name} onChange={(e) => updateEc(campaignId, enc.id, { name: e.target.value })} className="forge-field mt-2" />
            </label>
            <p className="forge-muted mt-3 text-[11px] uppercase">Строки существ</p>
            <div className="space-y-2 font-mono text-[11px]">
              {(enc.monsterQuantities ?? []).map((mq, idx) => {
                const m = campaign.monsterBlocks?.find((x) => x.id === mq.monsterId);
                return (
                  <div key={`${mq.monsterId}-${idx}`} className="flex flex-wrap items-center gap-2 border-t border-dotted border-[var(--tt-line)] pt-2">
                    <select
                      value={mq.monsterId}
                      onChange={(e) => {
                        const next = (enc.monsterQuantities ?? []).map((row, i) => (i === idx ? { ...row, monsterId: e.target.value } : row));
                        updateEc(campaignId, enc.id, { monsterQuantities: next });
                      }}
                      className="forge-field min-w-[160px]"
                    >
                      {(campaign.monsterBlocks ?? []).map((mm) => (
                        <option key={mm.id} value={mm.id}>
                          {mm.name} ({mm.cr})
                        </option>
                      ))}
                    </select>
                    ×
                    <input
                      type="number"
                      min={1}
                      value={mq.count}
                      onChange={(e) => {
                        const next = (enc.monsterQuantities ?? []).map((row, i) =>
                          i === idx ? { ...row, count: Math.max(1, Number(e.target.value) || 1) } : row,
                        );
                        updateEc(campaignId, enc.id, { monsterQuantities: next });
                      }}
                      className="forge-field w-20 py-2"
                    />
                    <button
                      type="button"
                      className="forge-muted underline"
                      onClick={() => {
                        const next = enc.monsterQuantities.filter((_row, i) => i !== idx);
                        updateEc(campaignId, enc.id, { monsterQuantities: next });
                      }}
                    >
                      убрать
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              className="forge-btn-outline mt-3 text-[10px]"
              onClick={() => {
                const first = campaign.monsterBlocks?.[0]?.id;
                if (!first) return;
                updateEc(campaignId, enc.id, { monsterQuantities: [...enc.monsterQuantities, { monsterId: first, count: 1 }] });
              }}
            >
              + строка монстра
            </button>
            <label className="mt-3 block text-sm">
              <span className="forge-label">Заметки</span>
              <textarea value={enc.notes ?? ""} onChange={(e) => updateEc(campaignId, enc.id, { notes: e.target.value })} className="forge-field mt-2 text-xs" />
            </label>
            <button type="button" className="forge-muted mt-2 text-[11px] underline" onClick={() => removeEc(campaignId, enc.id)}>
              удалить набор столкновения
            </button>
          </div>
        ))}
        <label className="block text-[12px]">
          <span className="forge-label">Персонажей для оценки (число на столе прямо сейчас)</span>
          <input
            type="number"
            min={1}
            max={12}
            value={partySizeDraft}
            onChange={(e) => setPartySizeDraft(Math.max(1, Number(e.target.value) || 1))}
            className="forge-field mt-2 w-24 py-2"
          />
          <span className="forge-muted ml-3 text-[11px]">уровень берётся из метадаты кампании.</span>
        </label>

        <label className="block text-[12px]">
          <span className="forge-label">Столкновение для расчёта</span>
          <select value={encSel?.id ?? ""} onChange={(e) => setEncPick(e.target.value)} className="forge-field mt-2 max-w-xl">
            {encList.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>

        <div className="forge-divider-gold border-t border-[var(--tt-line)] pt-5">
          {summaryForEncounter && encHasRows(campaign, encSel ?? null) ? (
            <div className="space-y-1 font-mono text-[11px]">
              <p>
                Совокупность CR → оценка: <strong>{tierRu[summaryForEncounter.tier]}</strong>
              </p>
              <p>Скорр. XP: {summaryForEncounter.adjustedXp.toLocaleString("ru-RU")}</p>
              <p>Методика та же что на общей странице «Встреча по XP», но уже на ваших карточках.</p>
            </div>
          ) : (
            <p className="forge-muted text-[12px]">Добавьте статблоки и хотя бы одну строку в первом сохранённом столкновении чтобы увидеть вердикт.</p>
          )}
          <Link href="/tools/encounter" className="forge-btn-outline mt-4 inline-flex text-[11px]">
            Открыть полный калькулятор встреч
          </Link>
        </div>
      </section>
    </div>
  );
}

function encHasRows(campaign: Campaign, enc: EncounterBuild | null): boolean {
  if (!enc?.monsterQuantities?.length) return false;
  return enc.monsterQuantities.some((q) => campaign.monsterBlocks?.some((m) => m.id === q.monsterId));
}
