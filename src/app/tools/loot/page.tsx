"use client";

import { useState } from "react";
import { ForgePage } from "@/components/ForgePage";
import { rollLootTier, type LootTier } from "@/lib/loot";

const TIERS: { key: LootTier; title: string; hint: string }[] = [
  { key: "minor", title: "Мелочь", hint: "гоблины, сумка в таверне" },
  { key: "standard", title: "Стандарт", hint: "главные бои недели приключения" },
  { key: "major", title: "Значимо", hint: "мини-босс, награда за тяжёлую задачу" },
  { key: "hoard", title: "Сокровище", hint: "крупный финал / логово" },
];

export default function LootToolPage() {
  const [tier, setTier] = useState<LootTier>("standard");
  const [last, setLast] = useState<ReturnType<typeof rollLootTier> | null>(null);

  return (
    <ForgePage title="Добыча" kicker="За столом" subtitle="Монеты и текстовые зацепки одним кликом.">
      <div className="forge-sheet mt-6 p-6">
        <p className="forge-muted text-sm leading-relaxed">
          Монетные суммы через кубики и текстовые зацепки. Не таблицы издателя — смешиваете с экономикой мира и своими списками добычи.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-4">
          {TIERS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTier(t.key)}
              className={`w-full border px-4 py-3 text-left font-mono transition ${
                tier === t.key
                  ? "border-[var(--tt-fg)] bg-[var(--tt-bg)]"
                  : "border border-dotted border-[var(--tt-line-strong)] bg-[var(--tt-bg-elev)] hover:border-[var(--tt-fg)]"
              }`}
            >
              <div className="text-sm font-semibold text-[var(--tt-fg)]">{t.title}</div>
              <div className="forge-muted mt-2 text-[11px]">{t.hint}</div>
            </button>
          ))}
        </div>

        <button type="button" className="forge-btn-gold mt-6 px-5" onClick={() => setLast(rollLootTier(tier))}>
          Сгенерировать
        </button>

        {last && (
          <div className="forge-inset mt-8 p-5">
            <h3 className="tt-display text-xl text-[var(--tt-fg)]">{last.summary}</h3>
            <ul className="forge-text-soft mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed marker:text-[var(--tt-muted)]">
              {last.detailLines.map((ln) => (
                <li key={ln}>{ln}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ForgePage>
  );
}
