"use client";

import { useMemo, useState } from "react";
import { SRD_FACTION_PRESETS } from "@/data/srd/presets";
import type { Campaign, LocationNode } from "@/domain/types";

function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(local: string): string {
  const t = Date.parse(local);
  if (Number.isNaN(t)) return new Date().toISOString();
  return new Date(t).toISOString();
}

export function TimelinePanel({
  entries,
  add,
  update,
  remove,
}: {
  entries: Campaign["timeline"];
  add: (payload: Omit<Campaign["timeline"][number], "id" | "createdAt">) => void;
  update: (entryId: string, patch: Partial<Campaign["timeline"][number]>) => void;
  remove: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", inGameDate: "", notes: "" });

  return (
    <div>
      <h2 className="text-lg font-semibold">Хронология</h2>
      <form
        className="mt-4 grid gap-3 md:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          add({ title: title.trim(), inGameDate: date.trim() || undefined, notes: notes.trim() });
          setTitle("");
          setDate("");
          setNotes("");
        }}
      >
        <input className="forge-field" placeholder="Событие" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="forge-field" placeholder="Дата в игре" value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="forge-btn-gold" type="submit">
          Добавить
        </button>
        <textarea className="md:col-span-3 forge-field" rows={3} placeholder="Заметки" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </form>

      <div className="mt-6 space-y-3">
        {entries.length === 0 && <p className="text-sm forge-muted">Записей пока нет.</p>}
        {entries.map((e) => (
          <div key={e.id} className="forge-inset">
            {editingId === e.id ? (
              <div className="grid gap-3">
                <input
                  className="forge-field py-2"
                  value={draft.title}
                  onChange={(x) => setDraft((d) => ({ ...d, title: x.target.value }))}
                />
                <input
                  className="forge-field py-2"
                  placeholder="Дата в игре"
                  value={draft.inGameDate}
                  onChange={(x) => setDraft((d) => ({ ...d, inGameDate: x.target.value }))}
                />
                <textarea
                  className="forge-field py-2"
                  rows={3}
                  value={draft.notes}
                  onChange={(x) => setDraft((d) => ({ ...d, notes: x.target.value }))}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="forge-btn-gold px-3 py-2 text-xs"
                    onClick={() => {
                      if (!draft.title.trim()) return;
                      update(e.id, {
                        title: draft.title.trim(),
                        inGameDate: draft.inGameDate.trim() || undefined,
                        notes: draft.notes.trim(),
                      });
                      setEditingId(null);
                    }}
                  >
                    Сохранить
                  </button>
                  <button type="button" className="forge-btn-outline px-3 py-2 text-xs" onClick={() => setEditingId(null)}>
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{e.title}</div>
                  {e.inGameDate && <div className="mt-1 text-xs forge-muted">В игре: {e.inGameDate}</div>}
                  {e.notes && <div className="mt-2 whitespace-pre-wrap text-sm forge-text-soft">{e.notes}</div>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    type="button"
                    className="text-xs forge-muted underline-offset-2 hover:text-[#1a1510]"
                    onClick={() => {
                      setEditingId(e.id);
                      setDraft({ title: e.title, inGameDate: e.inGameDate ?? "", notes: e.notes });
                    }}
                  >
                    править
                  </button>
                  <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => remove(e.id)}>
                    удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FactionsPanel({
  campaignId,
  items,
  add,
  update,
  remove,
}: {
  campaignId: string;
  items: Campaign["factions"];
  add: (campaignId: string, payload: Omit<Campaign["factions"][number], "id">) => void;
  update: (campaignId: string, factionId: string, patch: Partial<Campaign["factions"][number]>) => void;
  remove: (campaignId: string, factionId: string) => void;
}) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [presetPick, setPresetPick] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", notes: "" });
  return (
    <div>
      <h2 className="text-lg font-semibold">Фракции и организации</h2>
      <div className="forge-inset mt-4 grid gap-3 text-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <label className="block">
          <span className="forge-label">Структурные пресеты (SRD-характер, OGL-бог-схемы)</span>
          <select value={presetPick} onChange={(e) => setPresetPick(e.target.value)} className="forge-field mt-2">
            <option value="">Не из списка — вручную ниже</option>
            {SRD_FACTION_PRESETS.map((p) => (
              <option key={p.key} value={p.key}>
                {(p.nameEn ? `${p.nameRu} (${p.nameEn})` : p.nameRu).slice(0, 140)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="forge-btn-outline h-min px-4 py-3 text-[11px] normal-case md:justify-self-start"
          disabled={!presetPick}
          onClick={() => {
            const p = SRD_FACTION_PRESETS.find((x) => x.key === presetPick);
            if (!p) return;
            add(campaignId, { name: p.nameRu, notes: p.notes, srdPresetKey: p.key });
          }}
        >
          Добавить пресет
        </button>
        <p className="forge-muted md:col-span-2 text-[12px] leading-relaxed">
          Нет торговых «Гарперов» из коммерческих книг здесь быть не может — можно зафиксировать культ вокруг пантеона из приложений SRD либо нейтральные шаблоны и расшифровать лор текстом ниже.
        </p>
      </div>
      <form
        className="mt-4 grid gap-3 md:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          add(campaignId, { name: name.trim(), notes: notes.trim() });
          setName("");
          setNotes("");
        }}
      >
        <input className="forge-field md:col-span-2" placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="forge-btn-gold" type="submit">
          Добавить
        </button>
        <textarea className="md:col-span-3 forge-field" placeholder="Заметки" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </form>

      <div className="mt-6 space-y-3">
        {items.length === 0 && <p className="text-sm forge-muted">Пока нет фракций.</p>}
        {items.map((f) => (
          <div key={f.id} className="forge-inset">
            {editingId === f.id ? (
              <div className="grid gap-3">
                <input
                  className="forge-field py-2"
                  value={draft.name}
                  onChange={(x) => setDraft((d) => ({ ...d, name: x.target.value }))}
                />
                <textarea
                  className="forge-field py-2"
                  rows={3}
                  value={draft.notes}
                  onChange={(x) => setDraft((d) => ({ ...d, notes: x.target.value }))}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="forge-btn-gold px-3 py-2 text-xs"
                    onClick={() => {
                      if (!draft.name.trim()) return;
                      update(campaignId, f.id, { name: draft.name.trim(), notes: draft.notes.trim() });
                      setEditingId(null);
                    }}
                  >
                    Сохранить
                  </button>
                  <button type="button" className="forge-btn-outline px-3 py-2 text-xs" onClick={() => setEditingId(null)}>
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{f.name}</div>
                  {f.srdPresetKey && (
                    <p className="mt-2 text-[10px] uppercase tracking-[0.15em] forge-muted">
                      ключ пресета: {f.srdPresetKey}
                    </p>
                  )}
                  {f.notes && <div className="mt-2 whitespace-pre-wrap text-sm forge-text-soft">{f.notes}</div>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    type="button"
                    className="text-xs forge-muted underline-offset-2 hover:text-[#1a1510]"
                    onClick={() => {
                      setEditingId(f.id);
                      setDraft({ name: f.name, notes: f.notes });
                    }}
                  >
                    править
                  </button>
                  <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => remove(campaignId, f.id)}>
                    удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LocationsPanel({
  campaignId: _campaignId,
  items,
  add,
  update,
  remove,
  depth,
}: {
  campaignId: string;
  items: Campaign["locations"];
  add: (payload: Omit<Campaign["locations"][number], "id">) => void;
  update: (locId: string, patch: Partial<Campaign["locations"][number]>) => void;
  remove: (id: string) => void;
  depth: (loc: LocationNode, all: LocationNode[]) => number;
}) {
  const [name, setName] = useState("");
  const [tier, setTier] = useState<LocationNode["tier"]>("city");
  const [parentId, setParentId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", tier: "city" as LocationNode["tier"], parentId: "", notes: "" });

  const sorted = useMemo(() => [...items].sort((a, b) => a.name.localeCompare(b.name, "ru")), [items]);

  return (
    <div>
      <h2 className="text-lg font-semibold">Локации (иерархия)</h2>
      <p className="mt-2 text-sm forge-muted leading-relaxed">Уровни: мир → регион → город → район → здание. Родителя можно выбрать ниже.</p>

      <form
        className="mt-4 grid gap-3 md:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          add({
            name: name.trim(),
            tier,
            parentId: parentId || null,
            notes: notes.trim(),
          });
          setName("");
          setNotes("");
        }}
      >
        <input className="forge-field md:col-span-2" placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="forge-field" value={tier} onChange={(e) => setTier(e.target.value as LocationNode["tier"])}>
          <option value="world">Мир</option>
          <option value="region">Регион</option>
          <option value="city">Город</option>
          <option value="district">Район</option>
          <option value="building">Здание</option>
        </select>
        <select className="md:col-span-3 forge-field" value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">Без родителя (корень)</option>
          {items.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.tier})
            </option>
          ))}
        </select>
        <textarea className="md:col-span-3 forge-field" placeholder="Заметки" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button className="forge-btn-gold md:col-span-3" type="submit">
          Добавить локацию
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {sorted.length === 0 && <p className="text-sm forge-muted">Пока пусто.</p>}
        {sorted.map((l) => {
          const d = depth(l, items);
          return (
            <div key={l.id} style={{ marginLeft: `${d * 14}px` }} className="forge-inset">
              {editingId === l.id ? (
                <div className="grid gap-3">
                  <input
                    className="forge-field py-2"
                    value={draft.name}
                    onChange={(x) => setDraft((z) => ({ ...z, name: x.target.value }))}
                  />
                  <select
                    className="forge-field py-2"
                    value={draft.tier}
                    onChange={(x) => setDraft((z) => ({ ...z, tier: x.target.value as LocationNode["tier"] }))}
                  >
                    <option value="world">Мир</option>
                    <option value="region">Регион</option>
                    <option value="city">Город</option>
                    <option value="district">Район</option>
                    <option value="building">Здание</option>
                  </select>
                  <select className="forge-field py-2" value={draft.parentId} onChange={(x) => setDraft((z) => ({ ...z, parentId: x.target.value }))}>
                    <option value="">Без родителя</option>
                    {items
                      .filter((x) => x.id !== l.id)
                      .map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                  </select>
                  <textarea className="forge-field py-2" rows={3} value={draft.notes} onChange={(x) => setDraft((z) => ({ ...z, notes: x.target.value }))} />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="forge-btn-gold px-3 py-2 text-xs"
                      onClick={() => {
                        if (!draft.name.trim()) return;
                        update(l.id, {
                          name: draft.name.trim(),
                          tier: draft.tier,
                          parentId: draft.parentId || null,
                          notes: draft.notes.trim(),
                        });
                        setEditingId(null);
                      }}
                    >
                      Сохранить
                    </button>
                    <button type="button" className="forge-btn-outline px-3 py-2 text-xs" onClick={() => setEditingId(null)}>
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">
                      {l.name}{" "}
                      <span className="text-xs forge-muted">
                        · {l.tier}
                        {l.parentId ? ` · род.: ${items.find((x) => x.id === l.parentId)?.name ?? "?"}` : ""}
                      </span>
                    </div>
                    {l.notes && <div className="mt-2 whitespace-pre-wrap text-sm forge-text-soft">{l.notes}</div>}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <button
                      type="button"
                      className="text-xs forge-muted underline-offset-2 hover:text-[#1a1510]"
                      onClick={() => {
                        setEditingId(l.id);
                        setDraft({
                          name: l.name,
                          tier: l.tier,
                          parentId: l.parentId ?? "",
                          notes: l.notes,
                        });
                      }}
                    >
                      править
                    </button>
                    <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => remove(l.id)}>
                      удалить
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CharactersPanel({
  campaignId,
  items,
  add,
  update,
  remove,
}: {
  campaignId: string;
  items: Campaign["characters"];
  add: (campaignId: string, payload: Omit<Campaign["characters"][number], "id">) => void;
  update: (campaignId: string, charId: string, patch: Partial<Campaign["characters"][number]>) => void;
  remove: (campaignId: string, charId: string) => void;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"npc" | "pc">("npc");
  const [summary, setSummary] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", kind: "npc" as "npc" | "pc", summary: "" });
  return (
    <div>
      <h2 className="text-lg font-semibold">Персонажи</h2>
      <form
        className="mt-4 grid gap-3 md:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          add(campaignId, { name: name.trim(), kind, summary: summary.trim() });
          setName("");
          setSummary("");
        }}
      >
        <input className="forge-field md:col-span-2" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="forge-field" value={kind} onChange={(e) => setKind(e.target.value as "npc" | "pc")}>
          <option value="npc">NPC</option>
          <option value="pc">PC</option>
        </select>
        <textarea className="md:col-span-3 forge-field" placeholder="Кратко: роль, цели, связи…" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
        <button className="forge-btn-gold md:col-span-3" type="submit">
          Добавить
        </button>
      </form>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {items.length === 0 && <p className="text-sm forge-muted md:col-span-2">Персонажей пока нет.</p>}
        {items.map((ch) => (
          <div key={ch.id} className="forge-inset">
            {editingId === ch.id ? (
              <div className="grid gap-3">
                <input
                  className="forge-field py-2"
                  value={draft.name}
                  onChange={(x) => setDraft((d) => ({ ...d, name: x.target.value }))}
                />
                <select className="forge-field py-2" value={draft.kind} onChange={(x) => setDraft((d) => ({ ...d, kind: x.target.value as "npc" | "pc" }))}>
                  <option value="npc">NPC</option>
                  <option value="pc">PC</option>
                </select>
                <textarea className="forge-field py-2" rows={4} value={draft.summary} onChange={(x) => setDraft((d) => ({ ...d, summary: x.target.value }))} />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="forge-btn-gold px-3 py-2 text-xs"
                    onClick={() => {
                      if (!draft.name.trim()) return;
                      update(campaignId, ch.id, { name: draft.name.trim(), kind: draft.kind, summary: draft.summary.trim() });
                      setEditingId(null);
                    }}
                  >
                    Сохранить
                  </button>
                  <button type="button" className="forge-btn-outline px-3 py-2 text-xs" onClick={() => setEditingId(null)}>
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{ch.name}</div>
                  <div className="mt-1 text-xs forge-muted">{ch.kind.toUpperCase()}</div>
                  {ch.summary && <div className="mt-2 whitespace-pre-wrap text-sm forge-text-soft">{ch.summary}</div>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    type="button"
                    className="text-xs forge-muted underline-offset-2 hover:text-[#1a1510]"
                    onClick={() => {
                      setEditingId(ch.id);
                      setDraft({ name: ch.name, kind: ch.kind, summary: ch.summary });
                    }}
                  >
                    править
                  </button>
                  <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => remove(campaignId, ch.id)}>
                    удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuestsPanel({
  campaignId,
  items,
  add,
  update,
  remove,
}: {
  campaignId: string;
  items: Campaign["quests"];
  add: (payload: Omit<Campaign["quests"][number], "id">) => void;
  update: (questId: string, patch: Partial<Campaign["quests"][number]>) => void;
  remove: (id: string) => void;
}) {
  void campaignId;
  const [title, setTitle] = useState("");
  const [arc, setArc] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", arc: "", notes: "", status: "active" as Campaign["quests"][number]["status"] });
  return (
    <div>
      <h2 className="text-lg font-semibold">Квесты и арки</h2>
      <form
        className="mt-4 grid gap-3 md:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          add({ title: title.trim(), arc: arc.trim() || undefined, status: "active", notes: notes.trim() });
          setTitle("");
          setArc("");
          setNotes("");
        }}
      >
        <input className="forge-field md:col-span-2" placeholder="Название квеста" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="forge-btn-gold" type="submit">
          Добавить
        </button>
        <input className="md:col-span-3 forge-field" placeholder="Сюжетная арка (опционально)" value={arc} onChange={(e) => setArc(e.target.value)} />
        <textarea className="md:col-span-3 forge-field" rows={4} placeholder="Структура hook → расследование → кульминация → награда (заметки)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </form>

      <div className="mt-6 space-y-3">
        {items.length === 0 && <p className="text-sm forge-muted">Квестов пока нет.</p>}
        {items.map((q) => (
          <div key={q.id} className="forge-inset">
            {editingId === q.id ? (
              <div className="grid gap-3">
                <input
                  className="forge-field py-2"
                  value={draft.title}
                  onChange={(x) => setDraft((d) => ({ ...d, title: x.target.value }))}
                />
                <input className="forge-field py-2" placeholder="Арка" value={draft.arc} onChange={(x) => setDraft((d) => ({ ...d, arc: x.target.value }))} />
                <select className="forge-field py-2" value={draft.status} onChange={(x) => setDraft((d) => ({ ...d, status: x.target.value as typeof draft.status }))}>
                  <option value="active">active</option>
                  <option value="paused">paused</option>
                  <option value="done">done</option>
                </select>
                <textarea className="forge-field py-2" rows={4} value={draft.notes} onChange={(x) => setDraft((d) => ({ ...d, notes: x.target.value }))} />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="forge-btn-gold px-3 py-2 text-xs"
                    onClick={() => {
                      if (!draft.title.trim()) return;
                      update(q.id, {
                        title: draft.title.trim(),
                        arc: draft.arc.trim() || undefined,
                        notes: draft.notes.trim(),
                        status: draft.status,
                      });
                      setEditingId(null);
                    }}
                  >
                    Сохранить
                  </button>
                  <button type="button" className="forge-btn-outline px-3 py-2 text-xs" onClick={() => setEditingId(null)}>
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">{q.title}</div>
                    {q.arc && <div className="mt-1 text-xs forge-muted">Арка: {q.arc}</div>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="forge-field py-2 text-xs"
                      value={q.status}
                      onChange={(e) => update(q.id, { status: e.target.value as Campaign["quests"][number]["status"] })}
                    >
                      <option value="active">active</option>
                      <option value="paused">paused</option>
                      <option value="done">done</option>
                    </select>
                    <button
                      type="button"
                      className="text-xs forge-muted underline-offset-2 hover:text-[#1a1510]"
                      onClick={() => {
                        setEditingId(q.id);
                        setDraft({ title: q.title, arc: q.arc ?? "", notes: q.notes, status: q.status });
                      }}
                    >
                      править
                    </button>
                    <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => remove(q.id)}>
                      удалить
                    </button>
                  </div>
                </div>
                {q.notes && <div className="mt-3 whitespace-pre-wrap text-sm forge-text-soft">{q.notes}</div>}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function GalleryPanel({
  campaignId,
  items,
  add,
  update,
  remove,
}: {
  campaignId: string;
  items: Campaign["gallery"];
  add: (campaignId: string, payload: Omit<Campaign["gallery"][number], "id">) => void;
  update: (campaignId: string, itemId: string, patch: Partial<Campaign["gallery"][number]>) => void;
  remove: (campaignId: string, itemId: string) => void;
}) {
  const [caption, setCaption] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ caption: "", url: "", notes: "" });
  return (
    <div>
      <h2 className="text-lg font-semibold">Галерея (ссылки)</h2>
      <p className="mt-2 text-sm forge-muted leading-relaxed">Ссылки на картинки (хостинг, облако) — файл на диск приложения не грузится.</p>
      <form
        className="mt-4 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!caption.trim()) return;
          add(campaignId, { caption: caption.trim(), url: url.trim() || undefined, notes: notes.trim() || undefined });
          setCaption("");
          setUrl("");
          setNotes("");
        }}
      >
        <input className="forge-field" placeholder="Подпись" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <input className="forge-field" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
        <textarea className="forge-field" rows={3} placeholder="Заметки" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button className="forge-btn-gold w-fit" type="submit">
          Добавить
        </button>
      </form>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {items.length === 0 && <p className="text-sm forge-muted md:col-span-2">Пока пусто.</p>}
        {items.map((g) => (
          <div key={g.id} className="forge-inset">
            {editingId === g.id ? (
              <div className="grid gap-3">
                <input
                  className="forge-field py-2"
                  value={draft.caption}
                  onChange={(x) => setDraft((d) => ({ ...d, caption: x.target.value }))}
                />
                <input className="forge-field py-2" placeholder="URL" value={draft.url} onChange={(x) => setDraft((d) => ({ ...d, url: x.target.value }))} />
                <textarea className="forge-field py-2" rows={3} value={draft.notes} onChange={(x) => setDraft((d) => ({ ...d, notes: x.target.value }))} />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="forge-btn-gold px-3 py-2 text-xs"
                    onClick={() => {
                      if (!draft.caption.trim()) return;
                      update(campaignId, g.id, {
                        caption: draft.caption.trim(),
                        url: draft.url.trim() || undefined,
                        notes: draft.notes.trim() || undefined,
                      });
                      setEditingId(null);
                    }}
                  >
                    Сохранить
                  </button>
                  <button type="button" className="forge-btn-outline px-3 py-2 text-xs" onClick={() => setEditingId(null)}>
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{g.caption}</div>
                  {g.url && (
                    <a className="mt-2 block truncate text-sm text-forge-accent underline" href={g.url} target="_blank" rel="noreferrer">
                      {g.url}
                    </a>
                  )}
                  {g.notes && <div className="mt-2 whitespace-pre-wrap text-sm forge-text-soft">{g.notes}</div>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    type="button"
                    className="text-xs forge-muted underline-offset-2 hover:text-[#1a1510]"
                    onClick={() => {
                      setEditingId(g.id);
                      setDraft({ caption: g.caption, url: g.url ?? "", notes: g.notes ?? "" });
                    }}
                  >
                    править
                  </button>
                  <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => remove(campaignId, g.id)}>
                    удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LogsPanel({
  campaignId,
  items,
  add,
  update,
  remove,
}: {
  campaignId: string;
  items: Campaign["sessionLogs"];
  add: (campaignId: string, payload: Omit<Campaign["sessionLogs"][number], "id">) => void;
  update: (campaignId: string, logId: string, patch: Partial<Campaign["sessionLogs"][number]>) => void;
  remove: (campaignId: string, logId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", startedAtLocal: "", notes: "" });
  return (
    <div>
      <h2 className="text-lg font-semibold">Лог сессий</h2>
      <form
        className="mt-4 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          add(campaignId, { title: title.trim(), startedAt: new Date().toISOString(), notes: notes.trim() });
          setTitle("");
          setNotes("");
        }}
      >
        <input className="forge-field" placeholder="Название встречи" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="forge-field" rows={4} placeholder="Краткий лог: что произошло, XP, тайминги…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button className="forge-btn-gold w-fit" type="submit">
          Добавить запись
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {items.length === 0 && <p className="text-sm forge-muted">Лог пуст.</p>}
        {items.map((l) => (
          <div key={l.id} className="forge-inset">
            {editingId === l.id ? (
              <div className="grid gap-3">
                <input className="forge-field py-2" value={draft.title} onChange={(x) => setDraft((d) => ({ ...d, title: x.target.value }))} />
                <label className="text-xs forge-muted">
                  Дата/время начала
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full forge-field py-2"
                    value={draft.startedAtLocal}
                    onChange={(x) => setDraft((d) => ({ ...d, startedAtLocal: x.target.value }))}
                  />
                </label>
                <textarea className="forge-field py-2" rows={4} value={draft.notes} onChange={(x) => setDraft((d) => ({ ...d, notes: x.target.value }))} />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="forge-btn-gold px-3 py-2 text-xs"
                    onClick={() => {
                      if (!draft.title.trim()) return;
                      update(campaignId, l.id, {
                        title: draft.title.trim(),
                        startedAt: draft.startedAtLocal ? datetimeLocalToIso(draft.startedAtLocal) : l.startedAt,
                        notes: draft.notes.trim(),
                      });
                      setEditingId(null);
                    }}
                  >
                    Сохранить
                  </button>
                  <button type="button" className="forge-btn-outline px-3 py-2 text-xs" onClick={() => setEditingId(null)}>
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{l.title}</div>
                  <div className="mt-1 text-xs forge-muted">
                    {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(l.startedAt))}
                  </div>
                  {l.notes && <div className="mt-2 whitespace-pre-wrap text-sm forge-text-soft">{l.notes}</div>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    type="button"
                    className="text-xs forge-muted underline-offset-2 hover:text-[#1a1510]"
                    onClick={() => {
                      setEditingId(l.id);
                      setDraft({
                        title: l.title,
                        startedAtLocal: isoToDatetimeLocal(l.startedAt),
                        notes: l.notes,
                      });
                    }}
                  >
                    править
                  </button>
                  <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => remove(campaignId, l.id)}>
                    удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
