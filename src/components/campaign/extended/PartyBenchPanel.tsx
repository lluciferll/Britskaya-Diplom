"use client";

import { useState } from "react";
import Link from "next/link";
import type { HomebrewRecordKind } from "@/domain/types";
import { useForgeStore } from "@/store/useForgeStore";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const HB_KINDS: HomebrewRecordKind[] = ["spell", "monster", "item", "race", "subclass"];

function hbLabel(k: HomebrewRecordKind) {
  const m: Record<HomebrewRecordKind, string> = {
    spell: "Заклинание",
    monster: "Монстр",
    item: "Предмет",
    race: "Расовая вариация",
    subclass: "Подкласс",
  };
  return m[k];
}

export function PartyBenchPanel({ campaignId }: { campaignId: string }) {
  const campaign = useForgeStore((s) => s.campaigns.find((c) => c.id === campaignId) ?? null);
  const updateChar = useForgeStore((s) => s.updateCharacter);
  const patchWrite = useForgeStore((s) => s.patchCampaignWritings);

  const addDoc = useForgeStore((s) => s.addLibraryDoc);
  const updDoc = useForgeStore((s) => s.updateLibraryDoc);
  const remDoc = useForgeStore((s) => s.removeLibraryDoc);
  const addHb = useForgeStore((s) => s.addHomebrewRecord);
  const updHb = useForgeStore((s) => s.updateHomebrewRecord);
  const remHb = useForgeStore((s) => s.removeHomebrewRecord);

  const [dmg, setDmg] = useState(5);
  const [scope, setScope] = useState<"pc" | "all">("pc");
  const [saveDc, setSaveDc] = useState(15);
  const [saveAttr, setSaveAttr] = useState("Ловкость");
  const [copyToast, setCopyToast] = useState("");

  const [importHint, setImportHint] = useState("");

  if (!campaign) return <p className="forge-muted">Кампании нет.</p>;

  const pcs = (campaign.characters ?? []).filter((c) => c.kind === "pc");
  const hk =
    campaign.horrorToolkit ?? {
      enabled: false,
      stressCap: 10,
      corruptionNotes: "",
      environmentNotes: "",
      corruptionIndex: 0,
      corruptionStep: 1,
      applyStressWithCorruption: false,
    };

  return (
    <div className="space-y-10">
      <section className="forge-inset space-y-5 p-5">
        <header>
          <p className="forge-label">Стол мастера про партию</p>
          <p className="forge-muted mt-2 text-[13px] leading-relaxed">
            Отдельно от окна сессии и инициативы: хиты PC, пассивки, быстрая порча из модуля хоррора, журнал находок. Спасбросок можно сформулировать кнопкой и зачитать группе за столом или вставить в свою напомятку на втором мониторе.
          </p>
        </header>
        <div className="overflow-x-auto border border-dotted border-[var(--tt-line)]">
          <table className="min-w-full border-collapse text-left font-mono text-[11px]">
            <thead>
              <tr className="forge-muted border-b border-dotted border-[var(--tt-line)]">
                <th className="p-2">Имя</th>
                <th className="p-2">HP</th>
                <th className="p-2">Вр. HP</th>
                <th className="p-2">Макс</th>
                <th className="p-2">КД</th>
                <th className="p-2">Вним.</th>
                <th className="p-2">Прониц.</th>
                <th className="p-2">Вдохн.</th>
                {hk.enabled && <th className="p-2">Стресс</th>}
              </tr>
            </thead>
            <tbody>
              {(campaign.characters ?? []).map((ch) => (
                <tr key={ch.id} className="border-b border-dotted border-[var(--tt-line)] align-top">
                  <td className="p-2">
                    <strong className="normal-case">{ch.name}</strong>
                    <span className="forge-muted block text-[10px] uppercase">{ch.kind === "pc" ? "PC" : "NPC"}</span>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="forge-field w-[4.5rem] py-1"
                      value={ch.currentHp ?? ""}
                      placeholder="—"
                      onChange={(e) => updateChar(campaignId, ch.id, { currentHp: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="forge-field w-[4.5rem] py-1"
                      value={ch.tempHp ?? ""}
                      placeholder="0"
                      onChange={(e) => updateChar(campaignId, ch.id, { tempHp: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="forge-field w-[4.5rem] py-1"
                      value={ch.maxHp ?? ""}
                      placeholder="—"
                      onChange={(e) => updateChar(campaignId, ch.id, { maxHp: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="forge-field w-[3.5rem] py-1"
                      value={ch.ac ?? ""}
                      placeholder="—"
                      onChange={(e) => updateChar(campaignId, ch.id, { ac: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="forge-field w-[3.5rem] py-1"
                      value={ch.passivePerception ?? ""}
                      placeholder="—"
                      onChange={(e) => updateChar(campaignId, ch.id, { passivePerception: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="forge-field w-[3.5rem] py-1"
                      value={ch.passiveInsight ?? ""}
                      placeholder="—"
                      onChange={(e) => updateChar(campaignId, ch.id, { passiveInsight: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={ch.inspiration ?? false}
                      onChange={(e) => updateChar(campaignId, ch.id, { inspiration: e.target.checked })}
                    />
                  </td>
                  {hk.enabled && (
                    <td className="p-2">
                      <input
                        type="number"
                        className="forge-field w-[3.5rem] py-1"
                        value={ch.stress ?? 0}
                        onChange={(e) => updateChar(campaignId, ch.id, { stress: Math.max(0, Number(e.target.value) || 0) })}
                      />
                      <span className="forge-muted ml-1 text-[9px]">/ {hk.stressCap}</span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <label className="block text-sm forge-text-soft">
          <span className="forge-label normal-case">Общий инвентарь / экипировка (вид партии)</span>
          <textarea
            rows={3}
            placeholder="Кто что носит если необходимо текстом"
            value={pcs[0]?.inventoryNotes ?? ""}
            onChange={(e) => pcs[0] && updateChar(campaignId, pcs[0].id, { inventoryNotes: e.target.value })}
            className="forge-field mt-2 text-xs"
          />
          <span className="mt-1 block text-[10px] forge-muted">
            Быстрый пример: инвентарь привязали к первому PC в списке; при необходимости дублируйте текст в карточку «Персонажи» вкладки выше.
          </span>
        </label>

        <label className="block text-sm forge-text-soft">
          <span className="forge-label normal-case">Лут / экипировка «только GM»</span>
          <textarea
            rows={2}
            placeholder="Невидимые для группы запасы / кражи / тайные усиления"
            value={pcs[0]?.gmHiddenItems ?? ""}
            onChange={(e) => pcs[0] && updateChar(campaignId, pcs[0].id, { gmHiddenItems: e.target.value })}
            className="forge-field mt-2 text-xs"
          />
        </label>

        <div className="flex flex-wrap items-end gap-3 border border-dotted border-[var(--tt-line-strong)] bg-[var(--tt-bg)] p-4">
          <label className="text-sm">
            урон или лечение (число)
            <input type="number" value={dmg} onChange={(e) => setDmg(Number(e.target.value) || 0)} className="forge-field mt-2 w-28 py-2" />
          </label>
          <label className="text-sm forge-muted">
            цель
            <select value={scope} onChange={(e) => setScope(e.target.value as "pc" | "all")} className="forge-field mt-2 uppercase">
              <option value="pc">только записанные как PC</option>
              <option value="all">всем в таблице</option>
            </select>
          </label>
          <button
            type="button"
            className="forge-btn-gold"
            onClick={() => {
              for (const ch of campaign.characters ?? []) {
                if (scope === "pc" && ch.kind !== "pc") continue;
                const cur = typeof ch.currentHp === "number" ? ch.currentHp : ch.maxHp ?? 0;
                updateChar(campaignId, ch.id, { currentHp: Math.max(0, cur - dmg) });
              }
            }}
          >
            Применить урон
          </button>
          <button
            type="button"
            className="forge-btn-outline normal-case tracking-normal text-[11px]"
            onClick={() => {
              for (const ch of campaign.characters ?? []) {
                if (scope === "pc" && ch.kind !== "pc") continue;
                const cur = typeof ch.currentHp === "number" ? ch.currentHp : 0;
                const mx = typeof ch.maxHp === "number" ? ch.maxHp : cur + dmg;
                updateChar(campaignId, ch.id, { currentHp: Math.min(mx, cur + dmg) });
              }
            }}
          >
            Применить лечение (+)
          </button>
        </div>

        <div className="forge-inset p-4 text-[12px]">
          <p className="forge-label mb-3">Разовый запрос на спасбросок партии</p>
          <div className="flex flex-wrap gap-3">
            <label className="text-sm">
              Характеристика
              <input value={saveAttr} onChange={(e) => setSaveAttr(e.target.value)} className="forge-field mt-2 w-40 py-2" />
            </label>
            <label className="text-sm">
              DC
              <input type="number" value={saveDc} onChange={(e) => setSaveDc(Number(e.target.value) || 0)} className="forge-field mt-2 w-20 py-2" />
            </label>
          </div>
          <button
            type="button"
            className="forge-btn-outline mt-3 text-[11px]"
            onClick={async () => {
              const line = `${campaign.title}: все, спасбросок по «${saveAttr}» КС ${saveDc} — огласите результат по убыванию.`;
              const ok = await copyText(line);
              setCopyToast(ok ? "Скопировано в буфер — зачитайте вслух или вставьте куда удобно." : "Не удалось скопировать — выделите текст вручную.");
            }}
          >
            Скопировать формулировку
          </button>
          {copyToast ? <p className="forge-muted mt-3 text-[11px]">{copyToast}</p> : null}
        </div>
      </section>

      <section className="forge-inset space-y-4 p-5">
        <p className="forge-label">Домашние правила · опыт · вдохновение текстом</p>
        <label className="block text-[12px]">
          Houserules / трактовки книги
          <textarea
            rows={8}
            value={campaign.houserulesMarkdown}
            onChange={(e) => patchWrite(campaignId, { houserulesMarkdown: e.target.value })}
            className="forge-field mt-2 leading-relaxed"
          />
        </label>
        <label className="block text-[12px]">
          Журнал «опыт · вдохновение · крупные находки»
          <textarea
            rows={6}
            value={campaign.lootAndRewardsLog}
            onChange={(e) => patchWrite(campaignId, { lootAndRewardsLog: e.target.value })}
            className="forge-field mt-2 font-mono text-xs leading-relaxed"
            placeholder={`2027-06-07 — вдохновение Сэму за ролевое решение арки\n2027-06-07 — +1200 xp всей группе за главу`}
          />
        </label>
        <Link href="/generators/shop" className="forge-btn-outline inline-flex text-[11px]">
          Генератор лавок (отдельный инструмент)
        </Link>
      </section>

      <section className="forge-inset space-y-4 p-5">
        <p className="forge-label">Модуль атмосферы: стресс и порча (жёсткий трекер)</p>
        <p className="text-[12px] leading-relaxed forge-muted">
          Величина шага <strong>N</strong> задаётся ниже. Кнопки +/− сдвигают индекс порчи на N и пишут строку в журнал наград. Опционально к тем же шагам прибавляется стресс всем PC.
          Отдельные издательские карточки и внешние сценарные скрипты сюда не подключаются — только локальная автоматика этого блока.
        </p>
        <label className="flex gap-3 text-[13px]">
          <input
            type="checkbox"
            checked={hk.enabled}
            onChange={(e) => patchWrite(campaignId, { horrorToolkit: { ...hk, enabled: e.target.checked } })}
          />{" "}
          Включить колонку стресса и автоматику порчи
        </label>
        <label className="block text-sm">
          Максимальный стресс (потолок для PC)
          <input
            type="number"
            className="forge-field mt-2 w-24 py-2"
            value={hk.stressCap}
            onChange={(e) =>
              patchWrite(campaignId, {
                horrorToolkit: { ...hk, stressCap: Math.max(1, Number(e.target.value) || 10) },
              })
            }
          />
        </label>
        <div className="grid gap-4 border border-dotted border-[var(--tt-line-strong)] bg-[var(--tt-bg)] p-4 md:grid-cols-2">
          <label className="text-sm">
            Шаг порчи N
            <input
              type="number"
              min={1}
              className="forge-field mt-2 w-28 py-2"
              value={hk.corruptionStep}
              onChange={(e) =>
                patchWrite(campaignId, {
                  horrorToolkit: { ...hk, corruptionStep: Math.max(1, Number(e.target.value) || 1) },
                })
              }
            />
          </label>
          <div className="flex flex-col justify-end gap-2">
            <p className="forge-label">Текущий индекс порчи: {hk.corruptionIndex}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="forge-btn-gold text-[11px] normal-case"
                disabled={!hk.enabled}
                onClick={() => {
                  const step = Math.max(1, hk.corruptionStep);
                  const next = hk.corruptionIndex + step;
                  const stamp = new Date().toISOString().slice(0, 19);
                  const line = `${stamp} — порча +${step} (индекс ${next})`;
                  const log = (campaign.lootAndRewardsLog ?? "").trim();
                  patchWrite(campaignId, {
                    horrorToolkit: { ...hk, corruptionIndex: next },
                    lootAndRewardsLog: log ? `${log}\n${line}` : line,
                  });
                  if (hk.applyStressWithCorruption && hk.enabled) {
                    for (const ch of pcs) {
                      const st = Math.min(hk.stressCap, (ch.stress ?? 0) + step);
                      updateChar(campaignId, ch.id, { stress: st });
                    }
                  }
                }}
              >
                + порча (N)
              </button>
              <button
                type="button"
                className="forge-btn-outline text-[11px] normal-case"
                disabled={!hk.enabled}
                onClick={() => {
                  const step = Math.max(1, hk.corruptionStep);
                  const next = Math.max(0, hk.corruptionIndex - step);
                  const stamp = new Date().toISOString().slice(0, 19);
                  const line = `${stamp} — порча −${step} (индекс ${next})`;
                  const log = (campaign.lootAndRewardsLog ?? "").trim();
                  patchWrite(campaignId, {
                    horrorToolkit: { ...hk, corruptionIndex: next },
                    lootAndRewardsLog: log ? `${log}\n${line}` : line,
                  });
                }}
              >
                − порча (N)
              </button>
            </div>
          </div>
        </div>
        <label className="flex gap-3 text-[12px] forge-text-soft">
          <input
            type="checkbox"
            checked={hk.applyStressWithCorruption}
            onChange={(e) =>
              patchWrite(campaignId, { horrorToolkit: { ...hk, applyStressWithCorruption: e.target.checked } })
            }
          />
          При +порча добавлять N к стрессу каждого PC (до потолка)
        </label>
        <label className="block text-[12px]">
          Заметки про «плохое знание»
          <textarea
            rows={3}
            value={hk.corruptionNotes}
            onChange={(e) => patchWrite(campaignId, { horrorToolkit: { ...hk, corruptionNotes: e.target.value } })}
            className="forge-field mt-2 text-xs"
          />
        </label>
        <label className="block text-[12px]">
          Особые стимулы локаций
          <textarea
            rows={3}
            value={hk.environmentNotes}
            onChange={(e) => patchWrite(campaignId, { horrorToolkit: { ...hk, environmentNotes: e.target.value } })}
            className="forge-field mt-2 text-xs"
          />
        </label>
      </section>

      <section className="forge-inset space-y-5 p-5">
        <div>
          <p className="forge-label">Журнал текстов книг (локально)</p>
          <p className="forge-muted mt-2 text-[12px] leading-relaxed">
            Свои конспекты правил или приключений. Автоматический импорт из PDF не делаем — он тяжёлый по разработке и
            не решает юридических условий книг издателя — вставляйте свой пересказ текстом.
          </p>
          <textarea
            className="forge-field mt-3 text-[11px]"
            placeholder="Скопируйте сюда сводку раздела книги для полнотекстового поиска в браузере кампании позже (пока просто храним как заметку)."
            value={importHint}
            onChange={(e) => setImportHint(e.target.value)}
          />
          <button
            type="button"
            className="forge-btn-outline mt-3 text-[10px]"
            onClick={() => {
              addDoc(campaignId, {
                title: "Импорт руками",
                scope: "homebrew",
                summary: importHint.trim().slice(0, 200),
                body: importHint,
                tags: ["черновик"],
              });
              setImportHint("");
            }}
          >
            Сохранить введённый текст как документ книжной полки
          </button>
        </div>

        {(campaign.libraryDocs ?? []).map((doc) => (
          <article key={doc.id} className="border border-dotted border-[var(--tt-line)] p-3">
            <input value={doc.title} onChange={(e) => updDoc(campaignId, doc.id, { title: e.target.value })} className="forge-field mb-2" />
            <select
              value={doc.scope}
              onChange={(e) => updDoc(campaignId, doc.id, { scope: e.target.value as typeof doc.scope })}
              className="forge-field mb-2 text-[11px] uppercase"
            >
              <option value="rules">Правило</option>
              <option value="adventure">Приключение</option>
              <option value="homebrew">Самодельщина</option>
            </select>
            <textarea rows={8} value={doc.body} onChange={(e) => updDoc(campaignId, doc.id, { body: e.target.value })} className="forge-field font-mono text-xs" />
            <button type="button" className="forge-muted mt-2 text-[11px] underline" onClick={() => remDoc(campaignId, doc.id)}>
              удалить
            </button>
          </article>
        ))}
      </section>

      <section className="forge-inset space-y-4 p-5">
        <header>
          <p className="forge-label">Homebrew-хранилище (поля текстом совместимо с блоками столкновений — на будущее)</p>
          <p className="forge-muted text-[11px]">Определение — простой список «ключ=значение» вашими словами; нет живого синтакс-парсера PDF.</p>
        </header>
        <button
          type="button"
          className="forge-btn-gold text-[10px]"
          onClick={() =>
            addHb(campaignId, {
              kind: "spell",
              name: "Новая запись",
              definition:
                "level=2\nschool=conjuration\nsummary=Строчка действия вашими словами\ncomponents=V,S\nlink_wiki=my-spell-notes",
            })
          }
        >
          Новая запись контента
        </button>
        {(campaign.homebrewDefinitions ?? []).map((hb) => (
          <div key={hb.id} className="border border-dotted border-[var(--tt-line-strong)] bg-[var(--tt-bg)] p-3 font-mono text-[11px]">
            <div className="grid gap-2 md:grid-cols-4">
              <label className="md:col-span-2">
                Имя
                <input value={hb.name} onChange={(e) => updHb(campaignId, hb.id, { name: e.target.value })} className="forge-field mt-2" />
              </label>
              <label className="md:col-span-2">
                Тип строчки
                <select value={hb.kind} onChange={(e) => updHb(campaignId, hb.id, { kind: e.target.value as HomebrewRecordKind })} className="forge-field mt-2 uppercase">
                  {HB_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {hbLabel(k)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-3 block">
              строки свойств
              <textarea rows={5} value={hb.definition} onChange={(e) => updHb(campaignId, hb.id, { definition: e.target.value })} className="forge-field mt-2 leading-relaxed" />
            </label>
            <button type="button" className="forge-muted mt-2 text-[11px] underline" onClick={() => remHb(campaignId, hb.id)}>
              удалить
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
