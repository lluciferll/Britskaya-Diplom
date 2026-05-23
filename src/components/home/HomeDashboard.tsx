"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { useForgeStore } from "@/store/useForgeStore";

const QUICK_TOOLS = [
  { href: "/tools/dice", title: "Кубики", desc: "d20, преимущество, помеха" },
  { href: "/tools/encounter", title: "Встреча по XP", desc: "сложность боя по CR" },
  { href: "/generators/emergency", title: "Emergency", desc: "NPC, событие, лавка разом" },
  { href: "/character-creator", title: "Лист персонажа", desc: "P1–P3 и экспорт PNG" },
  { href: "/atlas", title: "Атлас Faerûn", desc: "карта Forgotten Realms" },
  { href: "/reference", title: "Шпаргалка", desc: "состояния, DC, быстрые правила" },
] as const;

function relUpdated(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  if (!Number.isFinite(diff)) return "";
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} дн. назад`;
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(new Date(iso));
}

export function HomeDashboard() {
  const router = useRouter();
  const campaigns = useForgeStore((s) => s.campaigns);
  const createCampaign = useForgeStore((s) => s.createCampaign);
  const [newTitle, setNewTitle] = useState("");

  const recent = useMemo(
    () => [...campaigns].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 4),
    [campaigns],
  );

  function onCreate(e: FormEvent) {
    e.preventDefault();
    const id = createCampaign(newTitle);
    setNewTitle("");
    router.push(`/campaigns/${id}`);
  }

  return (
    <div className="space-y-10 pb-16">
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="forge-label">Продолжить</h2>
          {campaigns.length > 0 && (
            <Link href="/campaigns" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--tt-fg)] underline underline-offset-2">
              Все кампании
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="forge-sheet p-8 text-center">
            <p className="forge-muted text-sm leading-relaxed">Пока нет кампаний — создайте первую, чтобы собрать мир, столкновения и сессии в одном месте.</p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {recent.map((c) => (
              <li key={c.id} className="forge-sheet flex flex-col gap-4 p-5">
                <div className="min-w-0">
                  <Link href={`/campaigns/${c.id}`} className="font-serif text-xl font-semibold tracking-tight text-[var(--tt-fg)] hover:opacity-80">
                    {c.title}
                  </Link>
                  <p className="forge-muted mt-1 text-xs">
                    {c.system} · ур. {c.partyLevel} · обновлено {relUpdated(c.updatedAt)}
                  </p>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Link href={`/campaigns/${c.id}`} className="forge-btn-gold px-4 py-2 text-[11px] normal-case tracking-normal">
                    Открыть
                  </Link>
                  <Link href={`/session/${c.id}`} className="forge-btn-outline px-4 py-2 text-[11px] normal-case tracking-normal">
                    Игровой стол
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
        <section className="space-y-4">
          <h2 className="forge-label">Инструменты без кампании</h2>
          <p className="forge-muted -mt-1 text-[13px] leading-relaxed">
            То, что не привязано к конкретной партии — откроется сразу. Кампанийные столкновения, карта Watabou и вики — внутри карточки кампании.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {QUICK_TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="forge-sheet group flex h-full flex-col gap-1 p-4 transition-colors hover:bg-[rgba(10,10,10,0.03)]"
                >
                  <span className="font-semibold text-[var(--tt-fg)] group-hover:underline group-hover:underline-offset-2">{tool.title}</span>
                  <span className="forge-muted text-xs leading-relaxed">{tool.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <aside className="forge-sheet h-fit p-6">
          <h2 className="forge-label">Новая кампания</h2>
          <form className="mt-4 space-y-3" onSubmit={onCreate}>
            <label className="block">
              <span className="sr-only">Название</span>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Название партии"
                className="forge-field"
                required
              />
            </label>
            <button type="submit" className="forge-btn-gold w-full">
              Создать и открыть
            </button>
          </form>
          <p className="forge-muted mt-4 text-xs leading-relaxed">
            Импорт и полный список — на странице{" "}
            <Link href="/campaigns" className="text-[var(--tt-fg)] underline underline-offset-2">
              кампаний
            </Link>
            .
          </p>
        </aside>
      </div>

      <p className="forge-muted font-mono text-[10px] uppercase tracking-[0.18em]">
        Ctrl или ⌘ + K — поиск по разделам
      </p>
    </div>
  );
}
