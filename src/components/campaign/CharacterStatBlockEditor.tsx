"use client";

import { useState, type ReactNode } from "react";
import type { CharacterStatBlock, StatBlockFeature } from "@/domain/types";
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  ABILITY_SCORES,
  CHALLENGE_RATINGS,
  CREATURE_SIZES_RU,
  CREATURE_TYPES_RU,
  abilityModifier,
  emptyFeature,
} from "@/lib/characterStatBlock";

function ForgeAccordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="forge-accordion">
      <button type="button" className="forge-accordion-header" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>{title}</span>
        <span className="forge-accordion-chevron" data-open={open ? "1" : "0"} aria-hidden>
          ▾
        </span>
      </button>
      {open && <div className="forge-accordion-body">{children}</div>}
    </div>
  );
}

function FeatureListEditor({
  label,
  items,
  onChange,
  emptyName = "Без названия",
}: {
  label: string;
  items: StatBlockFeature[];
  onChange: (items: StatBlockFeature[]) => void;
  emptyName?: string;
}) {
  const updateItem = (id: string, patch: Partial<StatBlockFeature>) => {
    onChange(items.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };
  const removeItem = (id: string) => onChange(items.filter((f) => f.id !== id));
  const addItem = () => onChange([...items, emptyFeature(emptyName)]);

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-xs forge-muted">Пока пусто — нажмите «+», чтобы добавить блок.</p>}
      {items.map((f) => (
        <div key={f.id} className="forge-stat-feature">
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="forge-field min-w-[8rem] flex-1 py-1.5 text-xs"
              placeholder="Название"
              value={f.name}
              onChange={(e) => updateItem(f.id, { name: e.target.value })}
            />
            <button type="button" className="forge-btn-outline px-2 py-1 text-[10px]" onClick={() => removeItem(f.id)}>
              −
            </button>
          </div>
          <textarea
            className="forge-field mt-2 w-full py-1.5 text-xs"
            rows={3}
            placeholder="Описание (можно HTML: &lt;em&gt;курсив&lt;/em&gt;)"
            value={f.text}
            onChange={(e) => updateItem(f.id, { text: e.target.value })}
          />
        </div>
      ))}
      <button type="button" className="forge-btn-outline px-3 py-1.5 text-[10px]" onClick={addItem}>
        + {label}
      </button>
    </div>
  );
}

type Props = {
  value: CharacterStatBlock;
  onChange: (next: CharacterStatBlock) => void;
};

export function CharacterStatBlockEditor({ value, onChange }: Props) {
  const patch = (p: Partial<CharacterStatBlock>) => onChange({ ...value, ...p });
  const patchAbility = (key: (typeof ABILITY_KEYS)[number], score: number) =>
    onChange({ ...value, abilities: { ...value.abilities, [key]: score } });

  return (
    <div className="space-y-3">
      <ForgeAccordion title="Стат" defaultOpen>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="forge-label">Тип существа</span>
            <select
              className="mt-1 w-full forge-field py-1.5 text-xs"
              value={value.creatureType ?? ""}
              onChange={(e) => patch({ creatureType: e.target.value })}
            >
              <option value="">—</option>
              {CREATURE_TYPES_RU.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="forge-label">Подтип</span>
            <input
              className="mt-1 w-full forge-field py-1.5 text-xs"
              placeholder="гуманоид, воин…"
              value={value.subtype ?? ""}
              onChange={(e) => patch({ subtype: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="forge-label">Размер</span>
            <select
              className="mt-1 w-full forge-field py-1.5 text-xs"
              value={value.size ?? "Средний"}
              onChange={(e) => patch({ size: e.target.value })}
            >
              {CREATURE_SIZES_RU.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-3 block">
            <span className="forge-label">Мировоззрение</span>
            <input
              className="mt-1 w-full forge-field py-1.5 text-xs"
              placeholder="нейтральный добрый"
              value={value.alignment ?? ""}
              onChange={(e) => patch({ alignment: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="forge-label">Класс брони</span>
            <input
              className="mt-1 w-full forge-field py-1.5 text-xs"
              placeholder="16 (кожаная броня)"
              value={value.ac ?? ""}
              onChange={(e) => patch({ ac: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="forge-label">Очки здоровья</span>
            <input
              className="mt-1 w-full forge-field py-1.5 text-xs"
              placeholder="45 (6d8 + 18)"
              value={value.hp ?? ""}
              onChange={(e) => patch({ hp: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="forge-label">Скорость</span>
            <input
              className="mt-1 w-full forge-field py-1.5 text-xs"
              placeholder="30 фт."
              value={value.speed ?? ""}
              onChange={(e) => patch({ speed: e.target.value })}
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {ABILITY_KEYS.map((key) => (
            <label key={key} className="text-center">
              <span className="forge-label block">{ABILITY_LABELS[key]}</span>
              <select
                className="mt-1 w-full forge-field py-1.5 text-xs text-center"
                value={value.abilities[key]}
                onChange={(e) => patchAbility(key, Number(e.target.value))}
              >
                {ABILITY_SCORES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[10px] forge-muted">{abilityModifier(value.abilities[key])}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="forge-label">Спасброски</span>
            <input
              className="mt-1 w-full forge-field py-1.5 text-xs"
              placeholder="Лов +5, Тел +3"
              value={value.savingThrows ?? ""}
              onChange={(e) => patch({ savingThrows: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="forge-label">Навыки</span>
            <input
              className="mt-1 w-full forge-field py-1.5 text-xs"
              placeholder="Скрытность +6, Внимание +4"
              value={value.skills ?? ""}
              onChange={(e) => patch({ skills: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="forge-label">Уязвимости к урону</span>
            <input className="mt-1 w-full forge-field py-1.5 text-xs" value={value.damageVulnerabilities ?? ""} onChange={(e) => patch({ damageVulnerabilities: e.target.value })} />
          </label>
          <label className="block">
            <span className="forge-label">Сопротивления к урону</span>
            <input className="mt-1 w-full forge-field py-1.5 text-xs" value={value.damageResistances ?? ""} onChange={(e) => patch({ damageResistances: e.target.value })} />
          </label>
          <label className="block">
            <span className="forge-label">Иммунитет к урону</span>
            <input className="mt-1 w-full forge-field py-1.5 text-xs" value={value.damageImmunities ?? ""} onChange={(e) => patch({ damageImmunities: e.target.value })} />
          </label>
          <label className="block">
            <span className="forge-label">Иммунитет к состояниям</span>
            <input className="mt-1 w-full forge-field py-1.5 text-xs" value={value.conditionImmunities ?? ""} onChange={(e) => patch({ conditionImmunities: e.target.value })} />
          </label>
          <label className="block">
            <span className="forge-label">Чувства</span>
            <input
              className="mt-1 w-full forge-field py-1.5 text-xs"
              placeholder="тёмное зрение 60 фт."
              value={value.senses ?? ""}
              onChange={(e) => patch({ senses: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="forge-label">Пассивное восприятие</span>
            <input
              className="mt-1 w-full forge-field py-1.5 text-xs"
              placeholder="14"
              value={value.passivePerception ?? ""}
              onChange={(e) => patch({ passivePerception: e.target.value })}
            />
          </label>
          <label className="md:col-span-2 block">
            <span className="forge-label">Языки</span>
            <input
              className="mt-1 w-full forge-field py-1.5 text-xs"
              placeholder="общий, эльфийский"
              value={value.languages ?? ""}
              onChange={(e) => patch({ languages: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="forge-label">Класс опасности</span>
            <select className="mt-1 w-full forge-field py-1.5 text-xs" value={value.cr ?? "0"} onChange={(e) => patch({ cr: e.target.value })}>
              {CHALLENGE_RATINGS.map((cr) => (
                <option key={cr} value={cr}>
                  {cr}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="forge-label">Бонус мастерства</span>
            <input
              className="mt-1 w-full forge-field py-1.5 text-xs"
              placeholder="+2"
              value={value.proficiencyBonus ?? ""}
              onChange={(e) => patch({ proficiencyBonus: e.target.value })}
            />
          </label>
        </div>
      </ForgeAccordion>

      <ForgeAccordion title="Способности">
        <FeatureListEditor label="Способность" items={value.traits} onChange={(traits) => patch({ traits })} emptyName="Особенность" />
      </ForgeAccordion>

      <ForgeAccordion title="Действия" defaultOpen>
        <FeatureListEditor label="Действие" items={value.actions} onChange={(actions) => patch({ actions })} emptyName="Действие" />
      </ForgeAccordion>

      <ForgeAccordion title="Бонусные действия">
        <FeatureListEditor label="Бонусное действие" items={value.bonusActions} onChange={(bonusActions) => patch({ bonusActions })} />
      </ForgeAccordion>

      <ForgeAccordion title="Реакции">
        <FeatureListEditor label="Реакция" items={value.reactions} onChange={(reactions) => patch({ reactions })} />
      </ForgeAccordion>

      <ForgeAccordion title="Легендарные действия">
        <FeatureListEditor label="Легендарное действие" items={value.legendaryActions} onChange={(legendaryActions) => patch({ legendaryActions })} />
      </ForgeAccordion>

      <ForgeAccordion title="Описание существа" defaultOpen>
        <textarea
          className="forge-field w-full py-2 text-xs"
          rows={6}
          placeholder="Flavor-текст, внешность, поведение…"
          value={value.description ?? ""}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </ForgeAccordion>
    </div>
  );
}
