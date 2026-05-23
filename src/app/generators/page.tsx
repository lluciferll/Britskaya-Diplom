import Link from "next/link";
import { ForgePage } from "@/components/ForgePage";

const CARDS = [
  {
    href: "/generators/npc",
    title: "Генератор NPC",
    desc: "Имя, эпитет, внешность, секрет, мотивация, подсказки для голоса и блока статов.",
  },
  {
    href: "/generators/events",
    title: "Случайные события",
    desc: "Контекст (город, подземелье, постапок и т.д.), время суток и «опасность» сценки.",
  },
  {
    href: "/generators/shop",
    title: "Лавка / рынок",
    desc: "Ассортимент и флейвор для поселения — вы сами прикручиваете цены и редкость магии.",
  },
  {
    href: "/generators/emergency",
    title: "Emergency — всё сразу",
    desc: "Лицо NPC, маленькое событие и крючок — когда «пусто и некуда». В кампанию само не пишется, только копируете текст.",
  },
];

export default function GeneratorsPage() {
  return (
    <ForgePage title="Генераторы" kicker="Импровизация" subtitle="Текстовые заготовки для игры.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="forge-sheet group block p-6 transition hover:bg-[rgba(10,10,10,0.03)]"
          >
            <h2 className="tt-display text-xl text-[var(--tt-fg)]">{c.title}</h2>
            <p className="forge-muted mt-3 text-sm leading-relaxed">{c.desc}</p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--tt-muted)] group-hover:text-[var(--tt-fg)]">Открыть →</p>
          </Link>
        ))}
      </div>
    </ForgePage>
  );
}
