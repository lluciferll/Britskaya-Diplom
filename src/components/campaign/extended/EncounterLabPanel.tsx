"use client";

import { useEffect, useMemo, useState } from "react";
import { getSrdMonsterByKey, SRD_MONSTERS } from "@/data/srd/monsters";
import type { EncounterBuild } from "@/domain/types";
import { encounterHasDeployableRows, spawnCombatantsFromEncounter } from "@/lib/combatantFactory";
import { DIFFICULTY_TIER_RU, summarizeEncounterBuild } from "@/lib/encounterBuildSummary";
import { srdMonsterToStatblockPartial } from "@/lib/srdCatalog";
import { useRouter } from "next/navigation";
import { useForgeStore } from "@/store/useForgeStore";

export function EncounterLabPanel({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const campaign = useForgeStore((s) => s.campaigns.find((c) => c.id === campaignId) ?? null);
  const addMb = useForgeStore((s) => s.addMonsterBlock);
  const updateMb = useForgeStore((s) => s.updateMonsterBlock);
  const removeMb = useForgeStore((s) => s.removeMonsterBlock);
  const addEc = useForgeStore((s) => s.addEncounterBuild);
  const updateEc = useForgeStore((s) => s.updateEncounterBuild);
  const removeEc = useForgeStore((s) => s.removeEncounterBuild);
  const patchSession = useForgeStore((s) => s.patchSessionState);

  const pcCount = useMemo(
    () => (campaign?.characters ?? []).filter((c) => c.kind === "pc").length,
    [campaign?.characters],
  );

  const [partySizeDraft, setPartySizeDraft] = useState<number>(4);
  const [partySizeTouched, setPartySizeTouched] = useState(false);
  const [deployMsg, setDeployMsg] = useState("");

  useEffect(() => {
    if (partySizeTouched) return;
    const n = pcCount > 0 ? pcCount : 4;
    setPartySizeDraft(n);
  }, [pcCount, partySizeTouched]);

  if (!campaign) return <p className="forge-muted">Нет кампании.</p>;

  const activeCampaign = campaign;

  function duplicateEncounter(enc: EncounterBuild) {
    addEc(campaignId, {
      name: enc.name.trim() ? `${enc.name.trim()} (копия)` : "Копия столкновения",
      monsterQuantities: (enc.monsterQuantities ?? []).map((row) => ({ ...row })),
      notes: enc.notes ?? "",
    });
  }

  function deployEncounterToSession(enc: EncounterBuild) {
    if (!encounterHasDeployableRows(activeCampaign, enc)) {
      setDeployMsg("Добавьте хотя бы одну строку с существом из статблоков выше.");
      return;
    }
    const session = activeCampaign.session;
    const spawned = spawnCombatantsFromEncounter(activeCampaign, enc);
    if (!spawned.length) {
      setDeployMsg("Не удалось создать бойцов — проверьте привязку к статблокам.");
      return;
    }
    patchSession(campaignId, { combatants: [...session.combatants, ...spawned] });
    setDeployMsg(`Добавлено ${spawned.length} существ из «${enc.name}». Открываю игровой стол…`);
    router.push(`/session/${campaignId}`);
  }

  return (
    <div className="space-y-8">
      <div className="forge-inset text-[12px] leading-relaxed forge-muted">
        Каталог монстров — только <strong>Open Game License / SRD 5e</strong>. Полный список и поиск — в меню «Справка». Карточку можно править вручную после подстановки.
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
        {(activeCampaign.monsterBlocks ?? []).length === 0 ? (
          <p className="forge-muted text-[12px]">Создайте статблок или подставьте монстра из SRD — без этого столкновение не собрать.</p>
        ) : null}
        {(activeCampaign.monsterBlocks ?? []).map((m) => (
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
            <button type="button" className="forge-muted mt-2 text-[11px] underline" onClick={() => removeMb(campaignId, m.id)}>
              удалить статблок
            </button>
          </div>
        ))}
      </section>

      <section className="forge-inset space-y-4 p-5">
        <p className="forge-label">Сохранённые столкновения</p>
        <p className="forge-muted text-[12px]">
          Соберите состав из статблоков выше, оцените сложность и при необходимости выгрузите существ в инициативу игрового стола.
          {pcCount > 0 ? (
            <>
              {" "}
              В кампании <strong>{pcCount}</strong> PC — по умолчанию это число участвует в расчёте XP.
            </>
          ) : (
            <> PC во вкладке «Персонажи» пока нет — укажите размер группы вручную.</>
          )}
        </p>

        <label className="block text-[12px]">
          <span className="forge-label">Персонажей для оценки XP</span>
          <input
            type="number"
            min={1}
            max={12}
            value={partySizeDraft}
            onChange={(e) => {
              setPartySizeTouched(true);
              setPartySizeDraft(Math.max(1, Number(e.target.value) || 1));
            }}
            className="forge-field mt-2 w-24 py-2"
          />
          <span className="forge-muted ml-3 text-[11px]">уровень партии: {activeCampaign.partyLevel} (из обзора кампании).</span>
        </label>

        <button
          type="button"
          className="forge-btn-outline text-[11px]"
          onClick={() => {
            addEc(campaignId, {
              name: "Набор монстров для боя",
              monsterQuantities: [],
              notes: "",
            });
          }}
        >
          Новый набор столкновения
        </button>

        {(activeCampaign.encounters ?? []).length === 0 ? (
          <p className="forge-muted text-[12px]">Столкновений пока нет — создайте набор и добавьте строки монстров.</p>
        ) : null}

        {(activeCampaign.encounters ?? []).map((enc) => {
          const tier = summarizeEncounterBuild(activeCampaign, enc, partySizeDraft);
          return (
            <div key={enc.id} className="border border-dotted border-[var(--tt-line)] p-4">
              <label className="block text-sm">
                <span className="forge-label">Название</span>
                <input value={enc.name} onChange={(e) => updateEc(campaignId, enc.id, { name: e.target.value })} className="forge-field mt-2" />
              </label>

              {tier ? (
                <p className="mt-3 font-mono text-[11px]">
                  Оценка: <strong>{DIFFICULTY_TIER_RU[tier.tier]}</strong> · скорр. XP {tier.adjustedXp.toLocaleString("ru-RU")}
                </p>
              ) : (
                <p className="forge-muted mt-3 text-[11px]">Добавьте строки существ из статблоков — появится оценка сложности.</p>
              )}

              <p className="forge-muted mt-3 text-[11px] uppercase">Строки существ</p>
              <div className="space-y-2 font-mono text-[11px]">
                {(enc.monsterQuantities ?? []).map((mq, idx) => (
                  <div key={`${mq.monsterId}-${idx}`} className="flex flex-wrap items-center gap-2 border-t border-dotted border-[var(--tt-line)] pt-2">
                    <select
                      value={mq.monsterId}
                      onChange={(e) => {
                        const next = (enc.monsterQuantities ?? []).map((row, i) =>
                          i === idx ? { ...row, monsterId: e.target.value } : row,
                        );
                        updateEc(campaignId, enc.id, { monsterQuantities: next });
                      }}
                      className="forge-field min-w-[160px]"
                    >
                      {(activeCampaign.monsterBlocks ?? []).map((mm) => (
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
                        const next = (enc.monsterQuantities ?? []).filter((_row, i) => i !== idx);
                        updateEc(campaignId, enc.id, { monsterQuantities: next });
                      }}
                    >
                      убрать
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="forge-btn-outline mt-3 text-[10px]"
                disabled={!(activeCampaign.monsterBlocks ?? []).length}
                onClick={() => {
                  const first = activeCampaign.monsterBlocks?.[0]?.id;
                  if (!first) return;
                  updateEc(campaignId, enc.id, {
                    monsterQuantities: [...(enc.monsterQuantities ?? []), { monsterId: first, count: 1 }],
                  });
                }}
              >
                + строка монстра
              </button>
              <label className="mt-3 block text-sm">
                <span className="forge-label">Заметки</span>
                <textarea value={enc.notes ?? ""} onChange={(e) => updateEc(campaignId, enc.id, { notes: e.target.value })} className="forge-field mt-2 text-xs" />
              </label>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="forge-btn-gold text-[10px]"
                  disabled={!encounterHasDeployableRows(activeCampaign, enc)}
                  onClick={() => deployEncounterToSession(enc)}
                >
                  В инициативу стола
                </button>
                <button type="button" className="forge-btn-outline text-[10px]" onClick={() => duplicateEncounter(enc)}>
                  Дублировать набор
                </button>
                <button type="button" className="forge-muted text-[11px] underline" onClick={() => removeEc(campaignId, enc.id)}>
                  удалить
                </button>
              </div>
            </div>
          );
        })}

        {deployMsg ? <p className="forge-muted text-[12px]">{deployMsg}</p> : null}
      </section>
    </div>
  );
}
