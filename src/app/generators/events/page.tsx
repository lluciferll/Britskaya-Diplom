"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { generateEvent, type Danger, type EventContext, type TimeOfDay } from "@/lib/generators/events";

const CONTEXTS: { value: EventContext; label: string }[] = [
  { value: "city_street", label: "Город (улица)" },
  { value: "dungeon", label: "Подземелье" },
  { value: "wilderness", label: "Дикие земли" },
  { value: "tavern", label: "Таверна" },
  { value: "market", label: "Рынок" },
  { value: "castle", label: "Замок / особняк" },
  { value: "sea", label: "Море / порт" },
  { value: "space_postapoc", label: "Постап / космо-рены" },
];

export default function EventsGeneratorPage() {
  const [context, setContext] = useState<EventContext>("city_street");
  const [time, setTime] = useState<TimeOfDay | "">("");
  const [danger, setDanger] = useState<Danger | "">("");
  const [seed, setSeed] = useState<string>("");

  const pack = useMemo(() => {
    const s = seed.trim() ? Number(seed) : undefined;
    return generateEvent({
      seed: Number.isFinite(s!) ? Number(s) : undefined,
      context,
      time: time || undefined,
      danger: danger || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, context, time, danger]);

  return (
    <AppShell
      title="Случайные события"
      kicker="Подкидывает сцену"
      breadcrumb={[{ href: "/generators", label: "Генераторы" }]}
      subtitle="Выберите контекст дорогой / подземелья / порта и т.д.; генератор текстом предлагает микроконфликт, но не управляет столом автоматически."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="forge-sheet p-6">
          <h2 className="text-lg font-semibold tracking-tight">Фильтры</h2>
          <div className="mt-4 space-y-4 text-sm">
            <label className="block">
              <span className="forge-label">Контекст</span>
              <select value={context} onChange={(e) => setContext(e.target.value as EventContext)} className="forge-field mt-2">
                {CONTEXTS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="forge-label">Время суток (опционально)</span>
              <select value={time} onChange={(e) => setTime((e.target.value || "") as TimeOfDay | "")} className="forge-field mt-2">
                <option value="">Случайно</option>
                <option value="утро">утро</option>
                <option value="день">день</option>
                <option value="вечер">вечер</option>
                <option value="ночь">ночь</option>
              </select>
            </label>
            <label className="block">
              <span className="forge-label">Опасность (опционально)</span>
              <select value={danger} onChange={(e) => setDanger((e.target.value || "") as Danger | "")} className="forge-field mt-2">
                <option value="">Случайно</option>
                <option value="мирно">мирно</option>
                <option value="напряжённо">напряжённо</option>
                <option value="опасно">опасно</option>
                <option value="смертельно">смертельно</option>
              </select>
            </label>
            <label className="block">
              <span className="forge-label">Seed (опционально)</span>
              <input
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="forge-field mt-2 font-mono text-xs"
                placeholder="random"
              />
            </label>

            <button type="button" className="forge-btn-gold w-full" onClick={() => setSeed(String(Math.floor(Math.random() * 1_000_000_000)))}>
              Перегенерировать
            </button>
          </div>
        </section>

        <section className="forge-sheet p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold leading-tight tracking-tight">Сценка</h2>
              <p className="forge-muted mt-2 text-sm leading-relaxed">
                {pack.contextLabel} · {pack.timeLabel} · {pack.dangerLabel}
              </p>
              <p className="forge-muted mt-3 font-mono text-xs">seed: {pack.seed}</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div className="forge-inset rounded-sm p-5">
              <h3 className="forge-label text-sm font-semibold uppercase tracking-[0.2em]">Ситуация</h3>
              <p className="forge-text-soft mt-3 text-sm leading-relaxed">{pack.situation}</p>
            </div>
            <div className="forge-inset rounded-sm p-5">
              <h3 className="forge-label text-sm font-semibold uppercase tracking-[0.2em]">Поворот / цена</h3>
              <p className="forge-text-soft mt-3 text-sm leading-relaxed">{pack.twist}</p>
            </div>
            <div className="forge-inset rounded-sm p-5">
              <h3 className="forge-label text-sm font-semibold uppercase tracking-[0.2em]">Сенсорика</h3>
              <p className="forge-text-soft mt-3 text-sm leading-relaxed">{pack.sensory}</p>
            </div>
          </div>

          <p className="forge-muted mt-6 text-xs leading-relaxed">
            Дальше: пользовательские таблицы RollTable и композитор нескольких генераторов в один результат.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
