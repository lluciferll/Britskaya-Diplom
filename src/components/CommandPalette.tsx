"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PaletteLink = { href: string; label: string; hint: string };

const SECTIONS: { heading: string; links: PaletteLink[] }[] = [
  {
    heading: "Навигация",
    links: [
      { href: "/", label: "Главная", hint: "на старт" },
      { href: "/login", label: "Вход", hint: "аккаунт Supabase" },
      { href: "/campaigns", label: "Все кампании", hint: "список и бэкапы" },
      { href: "/lore", label: "Справка SRD", hint: "только чтение, открытые правила" },
    ],
  },
  {
    heading: "За столом",
    links: [
      { href: "/tools", label: "Обзор инструментов", hint: "куда зайти первым" },
      { href: "/tools/dice", label: "Кубики", hint: "формулы и d20" },
      { href: "/tools/encounter", label: "Встреча по XP", hint: "сложность боя 5e" },
      { href: "/tools/loot", label: "Добыча", hint: "награда на скорую руку" },
      { href: "/tools/encounter-builder", label: "Столкновения в кампании", hint: "монстры и оценка боя" },
      { href: "/reference", label: "Шпаргалка мастера", hint: "состояния и DC" },
    ],
  },
  {
    heading: "Генераторы",
    links: [
      { href: "/generators", label: "Обзор генераторов", hint: "" },
      { href: "/generators/npc", label: "NPC", hint: "имя, тайна, мотив" },
      { href: "/generators/events", label: "Случайные события", hint: "куда ушла партия" },
      { href: "/generators/shop", label: "Лавка", hint: "товары поселения" },
      { href: "/generators/emergency", label: "Emergency", hint: "всё разом" },
    ],
  },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const filteredSections = useMemo(() => {
    const s = q.trim().toLowerCase();
    const match = (l: PaletteLink) => `${l.label} ${l.hint}`.toLowerCase().includes(s);
    return SECTIONS.map((sec) => ({
      heading: sec.heading,
      links: s === "" ? sec.links : sec.links.filter(match),
    })).filter((sec) => sec.links.length > 0);
  }, [q]);

  const totalHits = filteredSections.reduce((n, sec) => n + sec.links.length, 0);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-[var(--tt-fg)]/25 p-4 pt-[8vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Быстрый переход"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="forge-modal-frame">
        <div className="forge-modal-sheet">
          <label className="forge-label sr-only">Поиск разделов</label>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Искать по названию…  (Ctrl / ⌘ + K)"
            className="forge-field w-full"
          />
          <p className="forge-muted mt-3 font-mono text-[10px] uppercase tracking-[0.18em]">
            Список сгруппирован по задачам · Esc — закрыть
          </p>

          <div className="forge-divider-gold !my-4" />

          <div className="max-h-[50vh] overflow-auto border border-dotted border-[var(--tt-line-strong)]">
            {filteredSections.map((sec) => (
              <div key={sec.heading}>
                <div className="sticky top-0 border-b border-dotted border-[var(--tt-line-strong)] bg-[var(--tt-bg)] px-3 py-2">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--tt-muted)]">{sec.heading}</p>
                </div>
                {sec.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={onClose}
                    className="flex items-center justify-between gap-3 border-b border-dotted border-[var(--tt-line)] px-3 py-3 font-mono text-sm hover:bg-[var(--tt-bg-elev)]"
                  >
                    <span className="font-medium text-[var(--tt-fg)]">{l.label}</span>
                    {l.hint ? (
                      <span className="forge-muted max-w-[13rem] shrink-0 text-right text-[10px] uppercase tracking-[0.1em]">{l.hint}</span>
                    ) : (
                      <span className="forge-muted shrink-0 text-[10px] uppercase opacity-60">перейти</span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
            {totalHits === 0 && (
              <p className="forge-muted px-3 py-5 font-mono text-sm">
                Совпадений нет — сбросьте поиск или откройте раздел через верхнее меню
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
