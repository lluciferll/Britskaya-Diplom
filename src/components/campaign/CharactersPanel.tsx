"use client";

import { useState } from "react";
import type { Campaign, CampaignCharacter } from "@/domain/types";
import { CharacterStatBlockEditor } from "@/components/campaign/CharacterStatBlockEditor";
import {
  combatPatchFromStatBlock,
  defaultStatBlock,
  normalizeStatBlock,
} from "@/lib/characterStatBlock";

type CharacterPayload = Omit<CampaignCharacter, "id">;

function emptyDraft(kind: "npc" | "pc" = "npc"): CharacterPayload {
  return {
    name: "",
    kind,
    summary: "",
    tags: "",
    personality: "",
    secret: "",
    motivation: "",
    statHint: "",
    inventoryNotes: "",
    gmHiddenItems: "",
    statBlock: defaultStatBlock(),
  };
}

function characterToDraft(ch: CampaignCharacter): CharacterPayload {
  return {
    name: ch.name,
    kind: ch.kind,
    summary: ch.summary,
    tags: ch.tags ?? "",
    personality: ch.personality ?? "",
    secret: ch.secret ?? "",
    motivation: ch.motivation ?? "",
    statHint: ch.statHint ?? "",
    inventoryNotes: ch.inventoryNotes ?? "",
    gmHiddenItems: ch.gmHiddenItems ?? "",
    statBlock: normalizeStatBlock(ch.statBlock),
  };
}

function trimOptional(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t ? t : undefined;
}

function draftToPayload(draft: CharacterPayload): CharacterPayload {
  const statBlock = normalizeStatBlock(draft.statBlock);
  const combat = combatPatchFromStatBlock(statBlock);
  const summary =
    draft.summary.trim() ||
    [draft.personality, draft.motivation, draft.secret].filter(Boolean).join("\n\n").trim();

  return {
    name: draft.name.trim(),
    kind: draft.kind,
    summary,
    tags: trimOptional(draft.tags),
    personality: trimOptional(draft.personality),
    secret: trimOptional(draft.secret),
    motivation: trimOptional(draft.motivation),
    statHint: trimOptional(draft.statHint),
    inventoryNotes: trimOptional(draft.inventoryNotes),
    gmHiddenItems: trimOptional(draft.gmHiddenItems),
    statBlock,
    ...combat,
  };
}

function CharacterForm({
  draft,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  draft: CharacterPayload;
  onChange: (next: CharacterPayload) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const patch = (p: Partial<CharacterPayload>) => onChange({ ...draft, ...p });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="md:col-span-2 block">
          <span className="forge-label">Имя</span>
          <input
            className="mt-1 w-full forge-field py-2"
            placeholder="Имя персонажа"
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="forge-label">Тип</span>
          <select className="mt-1 w-full forge-field py-2" value={draft.kind} onChange={(e) => patch({ kind: e.target.value as "npc" | "pc" })}>
            <option value="npc">NPC</option>
            <option value="pc">PC</option>
          </select>
        </label>
      </div>

      <CharacterStatBlockEditor
        value={normalizeStatBlock(draft.statBlock)}
        onChange={(statBlock) => patch({ statBlock })}
      />

      <div className="forge-inset space-y-3 p-4">
        <p className="forge-label">Заметки мастера</p>
        <label className="block">
          <span className="text-xs forge-muted">Теги (класс · раса · роль)</span>
          <input
            className="mt-1 w-full forge-field py-1.5 text-xs"
            placeholder="Тихая сталь · полурослик · воин-ветеран"
            value={draft.tags ?? ""}
            onChange={(e) => patch({ tags: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs forge-muted">Личность</span>
          <input
            className="mt-1 w-full forge-field py-1.5 text-xs"
            placeholder="харизматичный болтун, скрывает усталость за шутками"
            value={draft.personality ?? ""}
            onChange={(e) => patch({ personality: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs forge-muted">Секрет</span>
          <input
            className="mt-1 w-full forge-field py-1.5 text-xs"
            placeholder="должен кому-то из фракции крупную сумму"
            value={draft.secret ?? ""}
            onChange={(e) => patch({ secret: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs forge-muted">Мотивация</span>
          <input
            className="mt-1 w-full forge-field py-1.5 text-xs"
            placeholder="спасти семью"
            value={draft.motivation ?? ""}
            onChange={(e) => patch({ motivation: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs forge-muted">Краткая история / связи</span>
          <textarea
            className="mt-1 w-full forge-field py-1.5 text-xs"
            rows={3}
            placeholder="Роль в кампании, цели, связи с фракциями…"
            value={draft.summary}
            onChange={(e) => patch({ summary: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs forge-muted">Подсказка статов (D&D 5e)</span>
          <textarea
            className="mt-1 w-full forge-field py-1.5 text-xs"
            rows={2}
            placeholder="Воин 5 · AC 16 · HP ~45 · атака +6, 1d8+4"
            value={draft.statHint ?? ""}
            onChange={(e) => patch({ statHint: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs forge-muted">Инвентарь / экипировка</span>
          <textarea
            className="mt-1 w-full forge-field py-1.5 text-xs"
            rows={3}
            placeholder="Что носит персонаж, снаряжение, деньги…"
            value={draft.inventoryNotes ?? ""}
            onChange={(e) => patch({ inventoryNotes: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs forge-muted">Только для мастера (скрытый лут)</span>
          <textarea
            className="mt-1 w-full forge-field py-1.5 text-xs"
            rows={2}
            placeholder="Скрытые предметы, усиления, заметки по выдаче"
            value={draft.gmHiddenItems ?? ""}
            onChange={(e) => patch({ gmHiddenItems: e.target.value })}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="forge-btn-gold px-4 py-2 text-xs"
          onClick={onSubmit}
          disabled={!draft.name.trim()}
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="forge-btn-outline px-4 py-2 text-xs" onClick={onCancel}>
            Отмена
          </button>
        )}
      </div>
    </div>
  );
}

function CharacterCardPreview({ ch }: { ch: CampaignCharacter }) {
  const sb = ch.statBlock;
  const statLine = sb
    ? [sb.size, sb.creatureType, sb.alignment].filter(Boolean).join(", ")
    : "";
  const combatLine = sb ? [sb.ac && `КД ${sb.ac}`, sb.hp && `HP ${sb.hp}`, sb.speed && sb.speed].filter(Boolean).join(" · ") : "";

  return (
    <div className="min-w-0 space-y-2">
      {ch.tags && <div className="text-xs forge-muted">{ch.tags}</div>}
      {ch.personality && (
        <div className="text-sm forge-text-soft">
          <span className="forge-muted">Личность:</span> {ch.personality}
        </div>
      )}
      {ch.secret && (
        <div className="text-sm forge-text-soft">
          <span className="forge-muted">Секрет:</span> {ch.secret}
        </div>
      )}
      {ch.motivation && (
        <div className="text-sm forge-text-soft">
          <span className="forge-muted">Мотивация:</span> {ch.motivation}
        </div>
      )}
      {ch.summary && !ch.personality && !ch.motivation && (
        <div className="whitespace-pre-wrap text-sm forge-text-soft">{ch.summary}</div>
      )}
      {ch.summary && (ch.personality || ch.motivation) && (
        <div className="whitespace-pre-wrap text-sm forge-text-soft">{ch.summary}</div>
      )}
      {statLine && <div className="text-xs forge-muted">{statLine}</div>}
      {combatLine && <div className="text-xs forge-muted">{combatLine}</div>}
      {ch.statHint && (
        <div className="text-xs forge-muted">
          <span className="font-semibold">Подсказка статов:</span> {ch.statHint}
        </div>
      )}
      {sb?.description && <div className="whitespace-pre-wrap text-sm forge-text-soft">{sb.description}</div>}
      {sb && (sb.actions.length > 0 || sb.traits.length > 0) && (
        <div className="text-xs forge-muted">
          {sb.traits.length > 0 && `${sb.traits.length} способн.`}
          {sb.traits.length > 0 && sb.actions.length > 0 && " · "}
          {sb.actions.length > 0 && `${sb.actions.length} действ.`}
        </div>
      )}
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
  const [createDraft, setCreateDraft] = useState<CharacterPayload>(() => emptyDraft("npc"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<CharacterPayload>(() => emptyDraft());

  const saveNew = () => {
    if (!createDraft.name.trim()) return;
    add(campaignId, draftToPayload(createDraft));
    setCreateDraft(emptyDraft("npc"));
  };

  const saveEdit = (charId: string) => {
    if (!editDraft.name.trim()) return;
    update(campaignId, charId, draftToPayload(editDraft));
    setEditingId(null);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">Персонажи</h2>
      <p className="mt-2 text-sm forge-muted leading-relaxed">
        Тип <strong>PC</strong> — игроки партии (хиты и пассивки — в блоке статов ниже). <strong>NPC</strong> — остальные; они остаются здесь и в графе связей. В бою PC добавляйте в инициативу с экрана «Сессия».
      </p>

      <form
        className="mt-4 forge-inset p-4"
        onSubmit={(e) => {
          e.preventDefault();
          saveNew();
        }}
      >
        <p className="forge-label mb-4">Новый персонаж</p>
        <CharacterForm draft={createDraft} onChange={setCreateDraft} onSubmit={saveNew} submitLabel="Добавить" />
      </form>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {items.length === 0 && <p className="text-sm forge-muted md:col-span-2">Персонажей пока нет.</p>}
        {items.map((ch) => (
          <div key={ch.id} className={`forge-inset ${editingId === ch.id ? "md:col-span-2" : ""}`}>
            {editingId === ch.id ? (
              <CharacterForm
                draft={editDraft}
                onChange={setEditDraft}
                onSubmit={() => saveEdit(ch.id)}
                onCancel={() => setEditingId(null)}
                submitLabel="Сохранить"
              />
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{ch.name}</div>
                  <div className="mt-1 text-xs forge-muted">{ch.kind.toUpperCase()}</div>
                  <div className="mt-3">
                    <CharacterCardPreview ch={ch} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    type="button"
                    className="text-xs forge-muted underline-offset-2 hover:text-[#1a1510]"
                    onClick={() => {
                      setEditingId(ch.id);
                      setEditDraft(characterToDraft(ch));
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
