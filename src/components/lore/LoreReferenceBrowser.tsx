"use client";

import { useMemo, useState } from "react";
import { REFERENCE_CATEGORIES } from "@/data/reference/categories";
import { getReferenceCounts, getTotalReferenceCount } from "@/data/reference";
import type { ReferenceCategoryId, ReferenceEntry } from "@/data/reference/types";
import { entryId, searchReference } from "@/lib/referenceSearch";

function renderBody(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className={line.trim() === "" ? "h-2" : "mt-1 first:mt-0"}>
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="text-[var(--tt-fg)]">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{part}</span>
          ),
        )}
      </p>
    );
  });
}

function EntryListItem({
  entry,
  active,
  onSelect,
}: {
  entry: ReferenceEntry;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        active
          ? "forge-inset w-full border-2 border-[var(--tt-fg)] p-3 text-left"
          : "forge-inset w-full border border-dotted border-[var(--tt-line)] p-3 text-left transition hover:border-[var(--tt-line-strong)]"
      }
    >
      <span className="block text-sm font-semibold text-[var(--tt-fg)]">{entry.nameRu}</span>
      {entry.nameEn ? <span className="forge-muted mt-0.5 block text-[10px]">{entry.nameEn}</span> : null}
      <span className="forge-muted mt-1 block text-[11px]">
        {entry.subtitle}
        {entry.summary ? ` · ${entry.summary}` : ""}
      </span>
    </button>
  );
}

export function LoreReferenceBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ReferenceCategoryId>("spells");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(() => getReferenceCounts(), []);
  const totalAll = useMemo(() => getTotalReferenceCount(), []);

  const results = useMemo(() => searchReference(query, query.trim() ? "all" : category), [query, category]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return results.find((e) => entryId(e) === selectedId) ?? null;
  }, [results, selectedId]);

  const listEntries = query.trim() ? results : results.filter((e) => e.category === category);

  function pickCategory(id: ReferenceCategoryId) {
    setCategory(id);
    setSelectedId(null);
  }

  return (
    <div className="space-y-8">
      <section className="forge-inset space-y-4 border border-dotted border-[var(--tt-line-strong)] p-5">
        <p className="forge-label">Поиск по справке</p>
        <label className="block text-sm">
          <span className="forge-muted text-[11px] uppercase tracking-[0.14em]">Строка поиска</span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedId(null);
            }}
            placeholder="Имя, уровень, КО, описание…"
            className="forge-field mt-2 w-full py-2"
            autoComplete="off"
          />
        </label>
        <p className="forge-muted text-[12px]">
          {query.trim() ? (
            <>
              Найдено: <strong className="text-[var(--tt-fg)]">{results.length}</strong> по всем разделам
            </>
          ) : (
            <>
              В каталоге <strong className="text-[var(--tt-fg)]">{totalAll}</strong> записей SRD (русские описания).
            </>
          )}
        </p>
      </section>

      {!query.trim() ? (
        <section>
          <p className="forge-label mb-4">Разделы справочника</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {REFERENCE_CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => pickCategory(cat.id)}
                  className={
                    active
                      ? "forge-inset border-2 border-[var(--tt-fg)] p-4 text-left"
                      : "forge-inset border border-dotted border-[var(--tt-line)] p-4 text-left transition hover:border-[var(--tt-line-strong)]"
                  }
                >
                  <span className="font-mono text-lg leading-none text-[var(--tt-fg)]">{cat.icon}</span>
                  <span className="mt-2 block text-sm font-semibold text-[var(--tt-fg)]">{cat.labelRu}</span>
                  <span className="mt-1 block text-[10px] leading-snug forge-muted">
                    {counts[cat.id]} · {cat.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-3">
          <h2 className="forge-label">
            {query.trim() ? "Результаты" : REFERENCE_CATEGORIES.find((c) => c.id === category)?.labelRu ?? "Список"}
            <span className="forge-muted ml-2 font-normal normal-case">— {listEntries.length}</span>
          </h2>
          <div className="max-h-[min(70vh,640px)] space-y-2 overflow-y-auto pr-1">
            {listEntries.length === 0 ? (
              <p className="forge-inset p-4 text-sm forge-text-soft">Ничего не найдено. Измените запрос или раздел.</p>
            ) : (
              listEntries.map((entry) => (
                <EntryListItem
                  key={entryId(entry)}
                  entry={entry}
                  active={selectedId === entryId(entry)}
                  onSelect={() => setSelectedId(entryId(entry))}
                />
              ))
            )}
          </div>
        </div>

        <section className="min-h-[280px] lg:sticky lg:top-24">
          {selected ? (
            <article className="forge-inset border border-dotted border-[var(--tt-line-strong)] p-5">
              <header className="border-b border-dotted border-[var(--tt-line)] pb-4">
                <p className="forge-muted text-[10px] uppercase tracking-[0.14em]">
                  {REFERENCE_CATEGORIES.find((c) => c.id === selected.category)?.labelRu} · {selected.subtitle}
                </p>
                <h3 className="tt-display mt-2 text-2xl text-[var(--tt-fg)]">{selected.nameRu}</h3>
                {selected.nameEn ? <p className="forge-muted mt-1 text-sm">{selected.nameEn}</p> : null}
                {selected.summary ? <p className="mt-3 text-sm forge-text-soft">{selected.summary}</p> : null}
              </header>
              <div className="mt-4 font-mono text-[12px] leading-relaxed forge-text-soft">{renderBody(selected.body)}</div>
              <p className="mt-6 border-t border-dotted border-[var(--tt-line)] pt-4 text-[10px] forge-muted">
                Механика по открытым правилам SRD/OGL 5e. Не заменяет книги издателя.
              </p>
            </article>
          ) : (
            <div className="forge-inset flex min-h-[280px] items-center justify-center border border-dotted border-[var(--tt-line)] p-8 text-center">
              <p className="text-sm forge-muted">
                Выберите запись в списке слева — описание появится здесь, без перехода на другую страницу.
              </p>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
