"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Campaign, Combatant } from "@/domain/types";
import { combatantFromCharacter, combatantFromMonster } from "@/lib/combatantFactory";
import { DiceRoller } from "@/components/tools/DiceRoller";
import { AppShell } from "@/components/AppShell";
import { ForgeBootLoading, useForgeBootReady } from "@/components/ForgeBootContext";
import { rollD20WithModifier } from "@/lib/dice";
import { newId } from "@/lib/id";
import { linkWithFrom } from "@/lib/navigation";
import { useForgeStore } from "@/store/useForgeStore";

function formatClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function computeElapsed(session: Campaign["session"]): number {
  const base = session.elapsedBeforePauseMs;
  if (session.paused || !session.timerStartedAt) return base;
  const start = Date.parse(session.timerStartedAt);
  if (Number.isNaN(start)) return base;
  return base + (Date.now() - start);
}

export function SessionRoom({ campaignId }: { campaignId: string }) {
  const bootReady = useForgeBootReady();
  const campaign = useForgeStore((s) => s.campaigns.find((c) => c.id === campaignId) ?? null);
  const patchSession = useForgeStore((s) => s.patchSessionState);
  const reorderCombatants = useForgeStore((s) => s.reorderCombatants);
  const appendDiceRoll = useForgeStore((s) => s.appendDiceRoll);
  const clearDiceLog = useForgeStore((s) => s.clearDiceLog);

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 333);
    return () => window.clearInterval(id);
  }, []);

  const dragId = useRef<string | null>(null);
  const [pickValue, setPickValue] = useState("");

  const roster = useMemo(() => {
    if (!campaign) return { npcs: [], pcs: [], monsters: [] };
    const chars = campaign.characters ?? [];
    return {
      npcs: chars.filter((c) => c.kind === "npc"),
      pcs: chars.filter((c) => c.kind === "pc"),
      monsters: campaign.monsterBlocks ?? [],
    };
  }, [campaign]);

  if (!bootReady) {
    return (
      <AppShell title="Загрузка…" kicker="Сессия" breadcrumb={[{ href: "/campaigns", label: "Все кампании" }]}>
        <ForgeBootLoading title="Загружаем кампании…" />
      </AppShell>
    );
  }

  if (!campaign) {
    return (
      <AppShell title="Сессия — кампания не найдена" kicker="Ошибка" breadcrumb={[{ href: "/campaigns", label: "Все кампании" }]}>
        <Link className="forge-btn-gold inline-flex" href="/campaigns">
          К списку кампаний
        </Link>
      </AppShell>
    );
  }

  /** После guard — отдельная переменная, иначе TS ругается на `possibly null` во вложенных функциях. */
  const camp = campaign;
  const session = camp.session;
  const elapsed = computeElapsed(session);

  function startTimer() {
    if (!session.paused) return;
    patchSession(campaignId, {
      paused: false,
      timerStartedAt: new Date().toISOString(),
    });
  }

  function pauseTimer() {
    if (session.paused) return;
    const start = session.timerStartedAt ? Date.parse(session.timerStartedAt) : Date.now();
    const now = Date.now();
    patchSession(campaignId, {
      paused: true,
      timerStartedAt: null,
      elapsedBeforePauseMs: session.elapsedBeforePauseMs + Math.max(0, now - (Number.isNaN(start) ? now : start)),
    });
  }

  function resetTimer() {
    patchSession(campaignId, {
      paused: true,
      timerStartedAt: null,
      elapsedBeforePauseMs: 0,
    });
  }

  function addCombatant() {
    const c: Combatant = {
      id: newId(),
      name: "Новый боец",
      initiative: 10,
      initiativeBonus: 0,
      hp: 20,
      maxHp: 24,
      conditions: "",
    };
    patchSession(campaignId, { combatants: [...session.combatants, c] });
  }

  function addCombatantFromCampaign() {
    if (!pickValue) return;
    const [kind, id] = pickValue.split(":");
    if (!id) return;
    let next: Combatant | null = null;
    if (kind === "char") {
      const ch = (camp.characters ?? []).find((c) => c.id === id);
      if (ch) next = combatantFromCharacter(ch);
    } else if (kind === "monster") {
      const m = (camp.monsterBlocks ?? []).find((x) => x.id === id);
      if (m) next = combatantFromMonster(m);
    }
    if (!next) return;
    patchSession(campaignId, { combatants: [...session.combatants, next] });
    setPickValue("");
  }

  const rosterEmpty = roster.npcs.length === 0 && roster.pcs.length === 0 && roster.monsters.length === 0;

  function updateCombatant(id: string, patch: Partial<Combatant>) {
    patchSession(campaignId, {
      combatants: session.combatants.map((c) => (c.id !== id ? c : { ...c, ...patch })),
    });
  }

  function removeCombatant(id: string) {
    patchSession(campaignId, { combatants: session.combatants.filter((c) => c.id !== id) });
  }

  function sortCombatants() {
    const next = [...session.combatants].sort((a, b) => b.initiative - a.initiative);
    reorderCombatants(campaignId, next.map((c) => c.id));
  }

  function rollInitiativeForCombatant(c: Combatant) {
    const bonus = Number.isFinite(c.initiativeBonus ?? 0) ? Math.trunc(c.initiativeBonus ?? 0) : 0;
    const roll = rollD20WithModifier(bonus, "normal");
    appendDiceRoll(campaignId, {
      rolledAt: new Date().toISOString(),
      label: c.name,
      formula: roll.formula,
      detail: roll.detail,
      total: roll.total,
    });
    updateCombatant(c.id, { initiative: roll.total });
  }

  return (
    <AppShell
      title={`Сессия · ${camp.title}`}
      kicker="Таймер, инициатива и кубики — одна сохранёнка"
      breadcrumb={[
        { href: "/campaigns", label: "Все кампании" },
        { href: `/campaigns/${campaignId}`, label: "Кампания" },
      ]}
      subtitle="Все поля здесь сохраняются в выбранной кампании. Для простых расчётов без журнала откройте раздел «За столом» в верхнем меню."
    >
      <div className="grid gap-6">
        <section className="forge-sheet p-6 lg:max-w-xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Таймер вечера</h2>
              <p className="forge-muted mt-2 text-sm">{session.paused ? "Стоит на паузе" : "Идёт отсчёт"}</p>
            </div>
            <div className="font-mono text-3xl tabular-nums tracking-tight text-[var(--tt-fg)] sm:text-4xl">{formatClock(elapsed)}</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className="forge-btn-gold" onClick={startTimer} disabled={!session.paused}>
              Старт
            </button>
            <button type="button" className="forge-btn-outline" onClick={pauseTimer} disabled={session.paused}>
              Пауза
            </button>
            <button type="button" className="forge-btn-danger" onClick={resetTimer}>
              Сброс
            </button>
          </div>
          <p className="forge-muted mt-4 text-xs leading-relaxed">
            Таймер и журнал сохраняются в браузере вместе с кампанией — рассчитано на один ноутбук мастера за столом.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/campaigns/${campaignId}`} className="forge-btn-outline">
              Карточка кампании
            </Link>
            <Link href={`/maps/${campaignId}`} className="forge-btn-outline">
              Карта города
            </Link>
          </div>
        </section>

        <section className="forge-sheet p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Инициатива</h2>
              <p className="forge-muted mt-2 text-sm leading-relaxed">
                Строку можно потянуть мышкой, чтобы переупорядочить ход до броска. После записи чисел в «Иниц.» нажмите «Упорядочить по инициативе», чтобы высокие значения были выше списка.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                title="Ставит в порядок убывания по числу «Инициатива»"
                className="forge-btn-outline px-3 py-2 text-sm"
                onClick={sortCombatants}
              >
                Упорядочить по инициативе
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3 border border-dotted border-[var(--tt-line)] p-4">
            <p className="forge-label">Добавить из кампании</p>
            <p className="forge-muted text-[12px] leading-relaxed">
              NPC и монстры берутся с вкладок «Персонажи» и «Столкновения», игроки партии — с «Персонажи» (тип PC).
            </p>
            {rosterEmpty ? (
              <p className="forge-muted text-[12px]">
                Пока нечего выбрать — создайте NPC или статблок монстра в карточке кампании.
              </p>
            ) : (
              <div className="flex flex-wrap items-end gap-2">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Кто вступает в бой</span>
                  <select className="forge-field w-full py-2" value={pickValue} onChange={(e) => setPickValue(e.target.value)}>
                    <option value="">— выберите персонажа или монстра —</option>
                    {roster.pcs.length > 0 && (
                      <optgroup label="Партия (PC)">
                        {roster.pcs.map((ch) => (
                          <option key={ch.id} value={`char:${ch.id}`}>
                            {ch.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {roster.npcs.length > 0 && (
                      <optgroup label="NPC">
                        {roster.npcs.map((ch) => (
                          <option key={ch.id} value={`char:${ch.id}`}>
                            {ch.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {roster.monsters.length > 0 && (
                      <optgroup label="Монстры (статблоки)">
                        {roster.monsters.map((m) => (
                          <option key={m.id} value={`monster:${m.id}`}>
                            {m.name} (CR {m.cr})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </label>
                <button type="button" className="forge-btn-gold px-4 py-2 text-sm" disabled={!pickValue} onClick={addCombatantFromCampaign}>
                  Добавить
                </button>
                <button type="button" className="forge-btn-outline px-3 py-2 text-sm" onClick={addCombatant}>
                  Пустая строка
                </button>
              </div>
            )}
          </div>

          <div className="forge-inset mt-4 px-0 py-0">
            {session.combatants.length === 0 && (
              <div className="forge-muted px-5 py-5 text-sm">Списка бойцов пока нет — выберите NPC или монстра из кампании или добавьте пустую строку.</div>
            )}
            {session.combatants.map((c) => (
              <div
                key={c.id}
                className={`grid grid-cols-2 gap-3 border-t border-dotted border-[var(--tt-line)] p-4 first:border-t-0 sm:grid-cols-3 lg:grid-cols-6 ${dragId.current === c.id ? "bg-[rgba(10,10,10,0.05)]" : ""}`}
                draggable
                onDragStart={() => {
                  dragId.current = c.id;
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = dragId.current;
                  const to = c.id;
                  dragId.current = null;
                  if (!from || from === to) return;
                  const ids = session.combatants.map((x) => x.id);
                  const i = ids.indexOf(from);
                  const j = ids.indexOf(to);
                  if (i < 0 || j < 0) return;
                  const copy = [...ids];
                  copy.splice(i, 1);
                  copy.splice(j, 0, from);
                  reorderCombatants(campaignId, copy);
                }}
                onDragEnd={() => {
                  dragId.current = null;
                }}
              >
                <label className="col-span-full block">
                  <span className="forge-label">Имя</span>
                  <input
                    value={c.name}
                    onChange={(e) => updateCombatant(c.id, { name: e.target.value })}
                    className="forge-field mt-2 py-2"
                  />
                </label>
                <label>
                  <span className="forge-label">Иниц.</span>
                  <input
                    type="number"
                    value={c.initiative}
                    onChange={(e) => updateCombatant(c.id, { initiative: Number(e.target.value) })}
                    className="forge-field mt-2 w-full py-2"
                  />
                </label>
                <label>
                  <span className="forge-label">Мод</span>
                  <input
                    type="number"
                    value={c.initiativeBonus ?? 0}
                    onChange={(e) =>
                      updateCombatant(c.id, {
                        initiativeBonus: Number(e.target.value),
                      })
                    }
                    className="forge-field mt-2 w-full py-2"
                  />
                </label>
                <div className="flex flex-col justify-end">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] forge-muted">d20</span>
                  <button
                    type="button"
                    title="Бросить d20 + мод и записать в инициативу и журнал"
                    className="forge-btn-wood mt-2 w-full px-3 py-2 text-xs"
                    onClick={() => rollInitiativeForCombatant(c)}
                  >
                    Кинуть
                  </button>
                </div>
                <label>
                  <span className="forge-label">HP</span>
                  <input
                    type="number"
                    value={c.hp}
                    onChange={(e) => updateCombatant(c.id, { hp: Number(e.target.value) })}
                    className="forge-field mt-2 w-full py-2"
                  />
                </label>
                <label>
                  <span className="forge-label">Макс</span>
                  <input
                    type="number"
                    value={c.maxHp}
                    onChange={(e) => updateCombatant(c.id, { maxHp: Number(e.target.value) })}
                    className="forge-field mt-2 w-full py-2"
                  />
                </label>
                <label className="col-span-full block">
                  <span className="forge-label">Состояния</span>
                  <input
                    value={c.conditions}
                    onChange={(e) => updateCombatant(c.id, { conditions: e.target.value })}
                    className="forge-field mt-2 py-2"
                    placeholder="ошеломлён …"
                  />
                </label>
                <div className="col-span-full flex items-start justify-between gap-2">
                  <div className="forge-muted text-[11px] leading-relaxed">Перетаскивание между строками вставляет ряд на место сброса.</div>
                  <button
                    type="button"
                    className="forge-msg-err shrink-0 hover:underline text-xs"
                    title="Удалить"
                    onClick={() => removeCombatant(c.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

        </section>

        <section className="forge-sheet p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Кубики и журнал</h2>
              <p className="forge-muted mt-2 text-sm">Броски сохраняются в этой кампании. После боя можно очистить журнал.</p>
            </div>
            <button type="button" className="forge-btn-outline px-4 py-2 text-sm" onClick={() => clearDiceLog(campaignId)}>
              Очистить журнал
            </button>
          </div>
          <div className="mt-5">
            <DiceRoller campaignId={campaignId} variant="compact" />
          </div>
          <div className="forge-inset mt-6 max-h-60 overflow-auto px-0 py-0">
            {(session.diceLog ?? []).length === 0 ? (
              <div className="forge-muted px-4 py-4 text-sm">Пока пусто — сделайте бросок выше.</div>
            ) : (
              <ul className="text-sm">
                {[...(session.diceLog ?? [])]
                  .slice()
                  .reverse()
                  .map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-baseline gap-2 border-t border-dotted border-[var(--tt-line)] px-4 py-2 text-xs forge-text-soft first:border-t-0"
                    >
                      <span className="font-mono text-[10px] forge-muted">
                        {new Date(r.rolledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                      {r.label && (
                        <span className="border border-[var(--tt-fg)] px-1.5 py-px font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--tt-fg)]">
                          {r.label}
                        </span>
                      )}
                      <span className="font-mono text-[var(--tt-fg)]">{r.formula}</span>
                      <span className="font-semibold text-[var(--tt-fg)]">→ {r.total}</span>
                      <span className="forge-muted">{r.detail}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <Link
            href={linkWithFrom("/tools/dice", `/session/${campaignId}`, `Сессия · ${camp.title}`)}
            className="forge-muted mt-4 inline-flex text-xs underline-offset-4 hover:text-[var(--tt-fg)]"
          >
            Открыть полную страницу кубиков →
          </Link>
        </section>

        <section className="forge-sheet p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-sm">
              <span className="forge-label uppercase tracking-[0.18em]">Заметки только GM</span>
              <textarea
                value={session.gmNotes}
                onChange={(e) => patchSession(campaignId, { gmNotes: e.target.value })}
                rows={10}
                className="forge-field mt-3 leading-relaxed"
              />
            </label>
            <label className="block text-sm">
              <span className="forge-label uppercase tracking-[0.18em]">Реплики для зала</span>
              <textarea
                value={session.playerNotes}
                onChange={(e) => patchSession(campaignId, { playerNotes: e.target.value })}
                placeholder="Фразы, которые озвучиваете участникам за столом"
                rows={10}
                className="forge-field mt-3 leading-relaxed"
              />
            </label>
          </div>
          <p className="forge-muted mt-4 text-xs leading-relaxed">
            Оба поля видите только вы на этом ноутбуке; за стол участники опираются на озвучку и общие виды карты или листа, не на вторую вкладку приложения.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
