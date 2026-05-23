"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ForgePage } from "@/components/ForgePage";
import { linkWithFrom, sanitizeReturnPath } from "@/lib/navigation";

const CARDS = [
  { href: "/tools/dice", title: "Кубики", desc: "Формулы d20, преимущество и помеха." },
  { href: "/tools/encounter", title: "Встреча по XP", desc: "Сложность боя по CR и размеру группы." },
  { href: "/tools/loot", title: "Добыча", desc: "Монеты и сюжетные находки." },
  { href: "/character-creator", title: "Конструктор персонажа", desc: "Листы D&D 5e (P1–P3)." },
  { href: "/reference", title: "Шпаргалка мастера", desc: "Состояния и быстрые ссылки." },
  { href: "/atlas", title: "Атлас Faerûn", desc: "Интерактивная карта." },
];

export default function ToolsHubPage() {
  const searchParams = useSearchParams();
  const from = sanitizeReturnPath(searchParams.get("from"));
  const fromLabel = searchParams.get("fromLabel");

  const cardHref = (path: string) => {
    if (from) return linkWithFrom(path, from, fromLabel ?? undefined);
    return path;
  };

  return (
    <ForgePage title="За столом" kicker="Инструменты" subtitle="Кубики, расчёты и памятки.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={cardHref(c.href)}
            className="forge-sheet group block p-6 transition hover:bg-[rgba(10,10,10,0.03)]"
          >
            <h2 className="tt-display text-xl text-[var(--tt-fg)]">{c.title}</h2>
            <p className="forge-muted mt-3 text-sm leading-relaxed">{c.desc}</p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--tt-muted)] group-hover:text-[var(--tt-fg)]">
              Открыть →
            </p>
          </Link>
        ))}
      </div>
    </ForgePage>
  );
}
