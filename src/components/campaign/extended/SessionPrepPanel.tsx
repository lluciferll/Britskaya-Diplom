"use client";

import { useEffect, useState } from "react";
import type { SessionBlockKind } from "@/domain/types";
import { useForgeStore } from "@/store/useForgeStore";

const KINDS: { key: SessionBlockKind; label: string; hint: string }[] = [
  { key: "scene", label: "Сцена", hint: "что происходит голосом рассказчика" },
  { key: "note", label: "Заметка", hint: "для себя, не читать партии" },
  { key: "music", label: "Музыка", hint: "ссылка Spotify / YouTube и т.п." },
  { key: "wiki", label: "Заметка лора", hint: "произвольный текст; глобальные правила — раздел «Справка» в меню" },
  { key: "monster", label: "Статблок", hint: "refId = id монстра из лаборатории столкновений" },
  { key: "quickdrop", label: "Готовый дроп", hint: "refId = id сохранённой заготовки сцены ниже" },
];

function blockPresetTitle(kind: SessionBlockKind): string {
  switch (kind) {
    case "scene":
      return "Новая сцена";
    case "music":
      return "Трек для настроения";
    case "wiki":
      return "Подсказка по миру";
    case "monster":
      return "Столкновение / существо";
    case "quickdrop":
      return "Вставить готовый блок";
    default:
      return "Заметка";
  }
}

export function SessionPrepPanel({ campaignId }: { campaignId: string }) {
  const campaign = useForgeStore((s) => s.campaigns.find((c) => c.id === campaignId) ?? null);
  const addMeeting = useForgeStore((s) => s.addSessionMeeting);
  const removeMeeting = useForgeStore((s) => s.removeSessionMeeting);
  const updateMeeting = useForgeStore((s) => s.updateSessionMeeting);
  const addBlock = useForgeStore((s) => s.addSessionBlock);
  const updateBlock = useForgeStore((s) => s.updateSessionBlock);
  const removeBlock = useForgeStore((s) => s.removeSessionBlock);
  const reorderBlocks = useForgeStore((s) => s.reorderSessionBlocks);
  const addDrop = useForgeStore((s) => s.addQuickDrop);
  const updateDrop = useForgeStore((s) => s.updateQuickDrop);
  const removeDrop = useForgeStore((s) => s.removeQuickDrop);

  const [meetingId, setMeetingId] = useState("");
  const meetings = campaign?.sessionPlans ?? [];
  const mt = meetings.find((m) => m.id === meetingId) ?? meetings[0];

  useEffect(() => {
    if (!meetings.length) {
      setMeetingId("");
      return;
    }
    if (!meetings.some((m) => m.id === meetingId)) setMeetingId(meetings[0]?.id ?? "");
  }, [meetings, meetingId]);

  if (!campaign) return <p className="forge-muted">Кампания не найдена.</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="forge-inset space-y-4 p-5">
        <header>
          <p className="forge-label">Хронология вечеров</p>
          <p className="forge-muted mt-2 text-[12px] leading-relaxed">
            Каждая запись — условный «вечер партии». Перетаскивание пока кнопками вверх/вниз по блокам внутри; позже можно подключить настоящий drag-n-drop.
          </p>
        </header>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="forge-btn-gold text-[10px]"
            onClick={() => {
              addMeeting(campaignId, { title: `Сессия ${meetings.length + 1}` });
              const created = useForgeStore.getState().campaigns.find((c) => c.id === campaignId)?.sessionPlans?.slice(-1)[0];
              if (created) setMeetingId(created.id);
            }}
          >
            Добавить вечер
          </button>
        </div>
        <label className="block text-sm">
          <span className="forge-label">Активный план</span>
          <select value={mt?.id ?? ""} onChange={(e) => setMeetingId(e.target.value)} className="forge-field mt-2">
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
                {m.whenLabel ? ` · ${m.whenLabel}` : ""}
              </option>
            ))}
          </select>
        </label>
        {!mt ? (
          <p className="text-sm forge-muted">Создайте первый блок сессии кнопкой выше.</p>
        ) : (
          <>
            <div className="grid gap-2 md:grid-cols-3">
              <label className="text-sm md:col-span-2">
                <span className="forge-label">Название вечера</span>
                <input
                  value={mt.title}
                  onChange={(e) => updateMeeting(campaignId, mt.id, { title: e.target.value })}
                  className="forge-field mt-2"
                />
              </label>
              <label className="text-sm">
                <span className="forge-label">Подпись даты</span>
                <input
                  value={mt.whenLabel ?? ""}
                  onChange={(e) => updateMeeting(campaignId, mt.id, { whenLabel: e.target.value })}
                  placeholder="«май №2», «нетто»..."
                  className="forge-field mt-2 text-xs"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  className="forge-btn-outline text-[10px]"
                  title={k.hint}
                  onClick={() =>
                    addBlock(campaignId, mt.id, {
                      kind: k.key,
                      title: blockPresetTitle(k.key),
                      content: "",
                    })
                  }
                >
                  + {k.label}
                </button>
              ))}
            </div>
            <ul className="space-y-4">
              {mt.blocks
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((blk) => (
                  <li key={blk.id} className="border border-dotted border-[var(--tt-line-strong)] bg-[var(--tt-bg)] p-3">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.15em] forge-muted">
                      <span>{KINDS.find((k) => k.key === blk.kind)?.label ?? blk.kind}</span>
                      <button
                        type="button"
                        className="forge-muted underline"
                        onClick={() =>
                          reorderBlocks(
                            campaignId,
                            mt.id,
                            reorderArray(
                              mt.blocks
                                .slice()
                                .sort((a, b) => a.order - b.order)
                                .map((x) => x.id),
                              blk.id,
                              -1,
                            ),
                          )
                        }
                      >
                        вверх
                      </button>
                      <button
                        type="button"
                        className="forge-muted underline"
                        onClick={() =>
                          reorderBlocks(
                            campaignId,
                            mt.id,
                            reorderArray(
                              mt.blocks
                                .slice()
                                .sort((a, b) => a.order - b.order)
                                .map((x) => x.id),
                              blk.id,
                              1,
                            ),
                          )
                        }
                      >
                        вниз
                      </button>
                      <button type="button" className="ml-auto forge-muted underline" onClick={() => removeBlock(campaignId, mt.id, blk.id)}>
                        удалить
                      </button>
                    </div>
                    <label className="mt-3 block text-sm">
                      <span className="forge-label">Подпись</span>
                      <input
                        value={blk.title}
                        onChange={(e) => updateBlock(campaignId, mt.id, blk.id, { title: e.target.value })}
                        className="forge-field mt-2 py-2"
                      />
                    </label>
                    <label className="mt-3 block text-sm">
                      <span className="forge-label">Содержание / URL / идентификатор связи</span>
                      <textarea
                        rows={4}
                        value={blk.content}
                        onChange={(e) => updateBlock(campaignId, mt.id, blk.id, { content: e.target.value })}
                        className="forge-field mt-2 font-mono text-xs"
                      />
                    </label>
                    {(blk.kind === "wiki" || blk.kind === "monster" || blk.kind === "quickdrop") && (
                      <label className="mt-3 block text-sm">
                        <span className="forge-label">Технич. refId (slug / UUID)</span>
                        <input
                          value={blk.refId ?? ""}
                          onChange={(e) => updateBlock(campaignId, mt.id, blk.id, { refId: e.target.value })}
                          className="forge-field mt-2 font-mono text-[11px]"
                          placeholder={
                            blk.kind === "wiki" ? "ref (опционально)" : blk.kind === "monster" ? "id статблока" : "id дропа"
                          }
                        />
                      </label>
                    )}
                  </li>
                ))}
            </ul>
            <button
              type="button"
              className="forge-btn-danger text-[11px]"
              onClick={() => mt && confirm("Удалить весь план вечера?") && removeMeeting(campaignId, mt.id)}
            >
              удалить активный вечер
            </button>
          </>
        )}
      </section>

      <section className="forge-inset space-y-4 p-5">
        <header>
          <p className="forge-label">Быстрые дроп-сцены («аналог Drops» локально)</p>
          <p className="forge-muted mt-2 text-[12px] leading-relaxed">
            Скомпонуйте заготовку раза текстом и ссылками и вставляйте в блок плана как <span className="font-mono">quickdrop</span>. Всё остаётся в этой кампании в браузере.
          </p>
        </header>
        <button
          type="button"
          className="forge-btn-gold w-full text-[11px]"
          onClick={() =>
            addDrop(campaignId, {
              title: "Новый дроп",
              mapUrl: "",
              sceneText: "",
              monsterSnippet: "",
              lootSnippet: "",
              wikiLinks: [],
            })
          }
        >
          Сохранить новую заготовку
        </button>
        <div className="space-y-4">
          {(campaign.quickDrops ?? []).map((d) => (
            <div key={d.id} className="border border-dotted border-[var(--tt-line)] p-3">
              <label className="block text-sm">
                <span className="forge-label">Название</span>
                <input value={d.title} onChange={(e) => updateDrop(campaignId, d.id, { title: e.target.value })} className="forge-field mt-2" />
              </label>
              <label className="mt-2 block text-sm">
                <span className="forge-label">Карта / фон (URL)</span>
                <input value={d.mapUrl ?? ""} onChange={(e) => updateDrop(campaignId, d.id, { mapUrl: e.target.value })} className="forge-field mt-2 text-xs" />
              </label>
              <label className="mt-2 block text-sm">
                <span className="forge-label">Описание сцены</span>
                <textarea
                  rows={3}
                  value={d.sceneText ?? ""}
                  onChange={(e) => updateDrop(campaignId, d.id, { sceneText: e.target.value })}
                  className="forge-field mt-2 text-xs"
                />
              </label>
              <label className="mt-2 block text-sm">
                <span className="forge-label">Монстры (текст / ссылка на статблок)</span>
                <textarea
                  rows={2}
                  value={d.monsterSnippet ?? ""}
                  onChange={(e) => updateDrop(campaignId, d.id, { monsterSnippet: e.target.value })}
                  className="forge-field mt-2 text-xs font-mono"
                />
              </label>
              <label className="mt-2 block text-sm">
                <span className="forge-label">Лут / награда</span>
                <textarea
                  rows={2}
                  value={d.lootSnippet ?? ""}
                  onChange={(e) => updateDrop(campaignId, d.id, { lootSnippet: e.target.value })}
                  className="forge-field mt-2 text-xs"
                />
              </label>
              <p className="forge-muted mt-2 font-mono text-[10px] uppercase">id: {d.id}</p>
              <button type="button" className="forge-muted mt-2 text-[11px] underline" onClick={() => removeDrop(campaignId, d.id)}>
                удалить дроп
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function reorderArray(ids: string[], id: string, dir: -1 | 1): string[] {
  const copy = ids.slice();
  const i = copy.indexOf(id);
  if (i < 0) return copy;
  const j = i + dir;
  if (j < 0 || j >= copy.length) return copy;
  const tmp = copy[i]!;
  copy[i] = copy[j]!;
  copy[j] = tmp;
  return copy;
}
