"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { generateNpc, type GeneratedNpc } from "@/lib/generators/npc";
import { useForgeStore } from "@/store/useForgeStore";

export default function NpcGeneratorPage() {
  const campaigns = useForgeStore((s) => s.campaigns);
  const addCharacter = useForgeStore((s) => s.addCharacter);
  const [pickCampaignId, setPickCampaignId] = useState<string>("");

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.location.search : "";
      const c = new URLSearchParams(raw).get("campaign");
      if (c) setPickCampaignId(c);
    } catch {
      /* ignore */
    }
  }, []);

  const [system, setSystem] = useState("D&D 5e");
  const [partyLevel, setPartyLevel] = useState(3);
  const [seed, setSeed] = useState<string>("");

  const npc: GeneratedNpc = useMemo(() => {
    const s = seed.trim() ? Number(seed) : undefined;
    return generateNpc({ seed: Number.isFinite(s!) ? Number(s) : undefined, partyLevel, systemHint: system });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, partyLevel, system]);

  return (
    <AppShell
      title="Генератор NPC"
      kicker="Тексты на лету"
      breadcrumb={[{ href: "/generators", label: "Генераторы" }]}
      subtitle="Подставляете уровень и системный намёк — получаете личность с секретами. Кнопка внизу может положить готовый NPC списком в выбранную кампанию."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="forge-sheet p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold tracking-tight">Параметры</h2>
          <div className="mt-4 space-y-4 text-sm">
            <label className="block">
              <span className="forge-label">Система (подсказка блока)</span>
              <input value={system} onChange={(e) => setSystem(e.target.value)} className="forge-field mt-2" />
            </label>
            <label className="block">
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
            <label className="block">
              <span className="forge-label">Seed (число, опционально)</span>
              <input
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="например 1337"
                className="forge-field mt-2 font-mono text-xs"
              />
            </label>

            <button
              type="button"
              className="forge-btn-gold w-full"
              onClick={() => setSeed(String(Math.floor(Math.random() * 1_000_000_000)))}
            >
              Случайный seed
            </button>

            <p className="forge-muted text-xs leading-relaxed">
              Портреты и авто-блоки статов сюда не встраивали — приложение офлайновое и компактное.
            </p>
          </div>
        </section>

        <section className="forge-sheet p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold leading-tight tracking-tight">
                {npc.firstName} {npc.lastName}
              </h2>
              <p className="forge-muted mt-2 text-sm">
                «{npc.epithet}» · {npc.ancestry} · {npc.role}
              </p>
              <p className="forge-muted mt-3 font-mono text-xs">seed: {npc.seed}</p>
            </div>
            <div className="forge-inset rounded-sm px-3 py-2 text-xs forge-text-soft">{npc.alignment}</div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="forge-label text-sm font-semibold uppercase tracking-[0.2em]">Внешность</h3>
              <p className="forge-text-soft mt-2 text-sm leading-relaxed">{npc.appearance}</p>
            </div>
            <div>
              <h3 className="forge-label text-sm font-semibold uppercase tracking-[0.2em]">Личность</h3>
              <p className="forge-text-soft mt-2 text-sm leading-relaxed">{npc.persona}</p>
            </div>
            <div>
              <h3 className="forge-label text-sm font-semibold uppercase tracking-[0.2em]">Секрет</h3>
              <p className="forge-text-soft mt-2 text-sm leading-relaxed">{npc.secret}</p>
            </div>
            <div>
              <h3 className="forge-label text-sm font-semibold uppercase tracking-[0.2em]">Мотивация</h3>
              <p className="forge-text-soft mt-2 text-sm leading-relaxed">{npc.motivation}</p>
            </div>
            <div>
              <h3 className="forge-label text-sm font-semibold uppercase tracking-[0.2em]">Голос</h3>
              <p className="forge-text-soft mt-2 text-sm leading-relaxed">{npc.voiceHint}</p>
            </div>
            <div>
              <h3 className="forge-label text-sm font-semibold uppercase tracking-[0.2em]">Привычка</h3>
              <p className="forge-text-soft mt-2 text-sm leading-relaxed">{npc.quirk}</p>
            </div>
          </div>

          <div className="forge-inset mt-6 rounded-sm p-5">
            <h3 className="forge-label text-sm font-semibold uppercase tracking-[0.2em]">Короткая история</h3>
            <p className="forge-text-soft mt-3 whitespace-pre-wrap text-sm leading-relaxed">{npc.shortHistory}</p>
          </div>

          <div className="forge-inset mt-6 rounded-sm p-5">
            <h3 className="forge-label text-sm font-semibold uppercase tracking-[0.2em]">Статблок (подсказка мастеру)</h3>
            <p className="forge-text-soft mt-3 text-sm leading-relaxed">{npc.statBlockNotes}</p>
          </div>

          <div className="forge-inset mt-6 rounded-sm p-5">
            <h3 className="forge-label text-sm font-semibold uppercase tracking-[0.2em]">В кампанию</h3>
            <p className="forge-muted mt-2 text-xs leading-relaxed">
              Сохраняет персонажа в списке NPC. Параметр <span className="font-mono">?campaign=id</span> подставится из кампании.
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="block min-w-[200px]">
                <span className="forge-label">Кампания</span>
                <select className="forge-field mt-2" value={pickCampaignId} onChange={(e) => setPickCampaignId(e.target.value)}>
                  <option value="">— выбрать —</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="forge-btn-gold disabled:opacity-40"
                disabled={!pickCampaignId}
                onClick={() => {
                  if (!pickCampaignId) return;
                  const name = `${npc.firstName} ${npc.lastName}`.trim();
                  const summary = [
                    `${npc.epithet} · ${npc.ancestry} · ${npc.role}`,
                    `Личность: ${npc.persona}`,
                    `Секрет: ${npc.secret}`,
                    `Мотивация: ${npc.motivation}`,
                    `История: ${npc.shortHistory}`,
                    `Подсказка статов: ${npc.statBlockNotes}`,
                  ].join("\n\n");
                  addCharacter(pickCampaignId, { name, kind: "npc", summary });
                }}
              >
                В персонажи кампании
              </button>
            </div>
            {campaigns.length === 0 && (
              <p className="forge-muted mt-4 text-xs">
                Кампаний нет —{" "}
                <Link href="/campaigns" className="font-medium text-[var(--tt-fg)] underline underline-offset-4 hover:opacity-70">
                  создайте кампанию
                </Link>
                .
              </p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
