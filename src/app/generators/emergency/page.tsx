"use client";

import { useMemo, useState } from "react";
import { ForgePage } from "@/components/ForgePage";
import { generateEmergency } from "@/lib/generators/emergency";

export default function EmergencyPage() {
  const [partyLevel, setPartyLevel] = useState(3);
  const [system, setSystem] = useState("D&D 5e");
  const [seed, setSeed] = useState<string>("");

  const pack = useMemo(() => {
    const s = seed.trim() ? Number(seed) : undefined;
    return generateEmergency({
      seed: Number.isFinite(s!) ? Number(s) : undefined,
      partyLevel,
      systemHint: system,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, partyLevel, system]);

  return (
    <ForgePage title="Emergency" kicker="SOS" subtitle="NPC, событие и крючок одним пакетом.">
      <div className="grid gap-6">
        <section className="forge-sheet p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight">Мне срочно нужно что‑то прямо сейчас</h2>
              <p className="forge-muted mt-3 text-sm leading-relaxed">
                Один пакет: NPC + случайное событие + крючок. Если seed пустой — «Перегенерировать» даёт новую комбинацию.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="forge-btn-gold px-5" onClick={() => setSeed(String(Math.floor(Math.random() * 1_000_000_000)))}>
                Перегенерировать
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <label className="block text-sm">
              <span className="forge-label">Seed</span>
              <input value={seed} onChange={(e) => setSeed(e.target.value)} className="forge-field mt-2 font-mono text-xs" />
            </label>
            <label className="block text-sm">
              <span className="forge-label">Уровень партии</span>
              <input
                type="number"
                min={1}
                max={20}
                value={partyLevel}
                onChange={(e) => setPartyLevel(Number(e.target.value))}
                className="forge-field mt-2"
              />
            </label>
            <label className="block text-sm">
              <span className="forge-label">Система (подсказка статов NPC)</span>
              <input value={system} onChange={(e) => setSystem(e.target.value)} className="forge-field mt-2" />
            </label>
          </div>

          <div className="mt-7 border border-dotted border-[#991b1b]/55 bg-[var(--tt-bg-elev)] p-5 text-[var(--tt-fg)]">
            <h3 className="forge-label text-[var(--tt-fg)]">Квест-крючок</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{pack.questHook}</p>
            <p className="forge-muted mt-3 font-mono text-[10px] uppercase tracking-[0.14em]">seed: {pack.seed}</p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="forge-sheet p-6">
            <h3 className="text-lg font-semibold tracking-tight">NPC</h3>
            <p className="forge-muted mt-2 text-sm leading-relaxed">
              {pack.npc.firstName} {pack.npc.lastName} «{pack.npc.epithet}» · {pack.npc.role}
            </p>
            <div className="forge-text-soft mt-4 space-y-3 text-sm">
              <p>
                <span className="forge-label text-[10px] uppercase tracking-[0.2em]">Внешность</span>
                <br />
                {pack.npc.appearance}
              </p>
              <p>
                <span className="forge-label text-[10px] uppercase tracking-[0.2em]">Секрет</span>
                <br />
                {pack.npc.secret}
              </p>
              <p>
                <span className="forge-label text-[10px] uppercase tracking-[0.2em]">Мотивация</span>
                <br />
                {pack.npc.motivation}
              </p>
              <p className="forge-muted font-mono text-xs">npc seed: {pack.npc.seed}</p>
            </div>
          </section>

          <section className="forge-sheet p-6">
            <h3 className="text-lg font-semibold tracking-tight">Событие</h3>
            <p className="forge-muted mt-2 text-sm">
              {pack.event.contextLabel} · {pack.event.timeLabel} · {pack.event.dangerLabel}
            </p>
            <div className="forge-text-soft mt-4 space-y-3 text-sm">
              <p>
                <span className="forge-label text-[10px] uppercase tracking-[0.2em]">Ситуация</span>
                <br />
                {pack.event.situation}
              </p>
              <p>
                <span className="forge-label text-[10px] uppercase tracking-[0.2em]">Поворот</span>
                <br />
                {pack.event.twist}
              </p>
              <p className="forge-muted font-mono text-xs">event seed: {pack.event.seed}</p>
            </div>
          </section>
        </div>
      </div>
    </ForgePage>
  );
}
