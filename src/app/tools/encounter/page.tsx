"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { encounterSummary, type DifficultyTier } from "@/lib/encounter5e";

const tierRu: Record<DifficultyTier, string> = {
  trivial: "Тривиально / лёгкая разминка",
  easy: "Лёгкая",
  medium: "Средняя",
  hard: "Тяжёлая",
  deadly: "Смертельная",
  over: "Выше смертельной",
};

export default function ToolsEncounterPage() {
  const [partyLevel, setPartyLevel] = useState(5);
  const [partySize, setPartySize] = useState(4);
  const [crText, setCrText] = useState("1\n1\n1/2");

  const crs = useMemo(
    () =>
      crText
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [crText],
  );

  const sum = useMemo(() => encounterSummary({ partyLevel, partySize, monsterCrs: crs }), [partyLevel, partySize, crs]);

  return (
    <AppShell
      title="Встреча по XP"
      kicker="За столом · D&amp;D 5e"
      breadcrumb={[{ href: "/tools", label: "За столом" }]}
      subtitle="Вводите CR каждого монстра с новой строки. Таблицы XP и множителей — как в книге мастера (ориентир)."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="forge-sheet p-6">
          <h2 className="forge-label text-sm font-semibold uppercase tracking-[0.22em]">Партия</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="forge-label">Уровень (средний или целевой)</span>
              <input
                type="number"
                min={1}
                max={20}
                value={partyLevel}
                onChange={(e) => setPartyLevel(Number(e.target.value))}
                className="forge-field mt-2 py-2"
              />
            </label>
            <label className="block">
              <span className="forge-label">Число персонажей</span>
              <input
                type="number"
                min={1}
                max={12}
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className="forge-field mt-2 py-2"
              />
            </label>
          </div>
          <div className="mt-6">
            <label className="block">
              <span className="forge-label">CR монстров (по одному в строке или через запятую)</span>
              <textarea
                value={crText}
                onChange={(e) => setCrText(e.target.value)}
                rows={6}
                placeholder="Например:&#10;2&#10;2&#10;1/2&#10;0"
                className="forge-field mt-2 font-mono text-sm leading-relaxed"
              />
            </label>
          </div>
          <p className="forge-muted mt-4 text-[11px] leading-relaxed">
            Пороги Easy / Medium / Hard / Deadly и XP за CR взяты из стандартных таблиц 5e. Это ориентир, а не замена здравому смыслу и чертам монстров.
          </p>
        </section>

        <section className="forge-sheet p-6">
          <h2 className="forge-label text-sm font-semibold uppercase tracking-[0.22em]">Результат</h2>
          {sum.monsterCount === 0 ? (
            <p className="forge-muted mt-6 text-sm">Добавьте хотя бы один CR, чтобы посчитать встречу.</p>
          ) : (
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4 border-b border-dotted border-[var(--tt-line)] pb-3">
                <dt className="forge-muted">Монстров</dt>
                <dd className="font-mono text-[var(--tt-fg)]">{sum.monsterCount}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-dotted border-[var(--tt-line)] pb-3">
                <dt className="forge-muted">Сумма XP «как в книге»</dt>
                <dd className="font-mono text-[var(--tt-fg)]">{sum.rawXp.toLocaleString("ru-RU")}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-dotted border-[var(--tt-line)] pb-3">
                <dt className="forge-muted">Множитель за число</dt>
                <dd className="font-mono text-[var(--tt-fg)]">×{sum.multiplier}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-dotted border-[var(--tt-line)] pb-3">
                <dt className="forge-muted">Скорректированный XP</dt>
                <dd className="font-mono font-semibold text-[var(--tt-fg)]">{sum.adjustedXp.toLocaleString("ru-RU")}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-dotted border-[var(--tt-line)] pb-3">
                <dt className="forge-muted">Оценка</dt>
                <dd className="text-right font-medium text-[var(--tt-fg)]">{tierRu[sum.tier]}</dd>
              </div>
              <div>
                <p className="forge-muted text-xs uppercase tracking-[0.16em]">Пороги партии</p>
                <ul className="forge-text-soft mt-2 space-y-1 font-mono text-xs">
                  <li>Easy ≤ {sum.thresholds.easy.toLocaleString("ru-RU")}</li>
                  <li>Medium ≤ {sum.thresholds.medium.toLocaleString("ru-RU")}</li>
                  <li>Hard ≤ {sum.thresholds.hard.toLocaleString("ru-RU")}</li>
                  <li>Deadly ≤ {sum.thresholds.deadly.toLocaleString("ru-RU")}</li>
                </ul>
              </div>
            </dl>
          )}
          {sum.unknownCrs.length > 0 && (
            <p className="mt-6 border border-dotted border-neutral-800 bg-[var(--tt-bg-elev)] px-4 py-3 font-mono text-xs text-[var(--tt-fg)]">
              Не распознаны CR: {sum.unknownCrs.join(", ")}. Используйте «0», «1/8», «1/4», «1/2» или целые уровни до 30.
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
