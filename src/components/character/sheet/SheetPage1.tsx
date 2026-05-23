"use client";

import type { CharacterSheetData } from "@/lib/characterSheet/types";
import { SKILL_LABELS } from "@/lib/characterSheet/types";
import { ABILITY_ORDER, ABILITY_SHORT, SKILL_BY_ABILITY } from "@/lib/characterSheet/layout";
import {
  DeathSaveRow,
  SheetArea,
  SheetField,
  SheetPage,
  SheetSection,
  modFromScore,
} from "./sheetUi";

type Props = {
  data: CharacterSheetData;
  set: (patch: Partial<CharacterSheetData>) => void;
};

export function SheetPage1({ data, set }: Props) {
  const patchMeta = (patch: Partial<CharacterSheetData["meta"]>) => set({ meta: { ...data.meta, ...patch } });
  const patchCombat = (patch: Partial<CharacterSheetData["combat"]>) => set({ combat: { ...data.combat, ...patch } });
  const patchHp = (patch: Partial<CharacterSheetData["hp"]>) => set({ hp: { ...data.hp, ...patch } });

  return (
    <SheetPage>
      <header className="cs-header-grid">
        <div className="cs-meta-grid">
          <SheetField label="Имя" value={data.meta.name} onChange={(v) => patchMeta({ name: v })} />
          <SheetField label="Предыстория" value={data.meta.background} onChange={(v) => patchMeta({ background: v })} />
          <SheetField label="Класс" value={data.meta.className} onChange={(v) => patchMeta({ className: v })} />
          <SheetField label="Вид" value={data.meta.species} onChange={(v) => patchMeta({ species: v })} />
          <SheetField label="Подкласс" value={data.meta.subclass} onChange={(v) => patchMeta({ subclass: v })} />
        </div>

        <div className="cs-level-box">
          <span className="cs-field-label">Уровень</span>
          <input
            className="cs-input"
            value={data.meta.level}
            onChange={(e) => patchMeta({ level: e.target.value })}
          />
          <span className="cs-field-label">Опыт</span>
          <input className="cs-input" value={data.meta.xp} onChange={(e) => patchMeta({ xp: e.target.value })} />
        </div>

        <div className="cs-combat-mini">
          <div className="cs-ac-row">
            <SheetField label="КД" value={data.combat.ac} onChange={(v) => patchCombat({ ac: v })} inputClassName="text-center font-bold" />
            <label className="cs-shield-check">
              <input
                type="checkbox"
                checked={data.combat.shield}
                onChange={(e) => patchCombat({ shield: e.target.checked })}
              />
              Щит
            </label>
          </div>
          <div>
            <span className="cs-field-label">Тек. / вр. / макс. HP</span>
            <div className="cs-hp-row">
              <input className="cs-input" value={data.hp.current} onChange={(e) => patchHp({ current: e.target.value })} />
              <input className="cs-input" value={data.hp.temp} onChange={(e) => patchHp({ temp: e.target.value })} />
              <input className="cs-input" value={data.hp.max} onChange={(e) => patchHp({ max: e.target.value })} />
            </div>
          </div>
        </div>
      </header>

      <div className="cs-body-grid">
        <aside className="cs-abilities-col">
          <div className="cs-prof-box">
            <span className="cs-field-label">Бонус мастерства</span>
            <input
              className="cs-input"
              value={data.combat.profBonus}
              onChange={(e) => patchCombat({ profBonus: e.target.value })}
            />
          </div>

          {ABILITY_ORDER.map(({ key }) => (
            <div key={key} className="cs-ability-block">
              <div className="cs-ability-head">
                <span>{ABILITY_SHORT[key]}</span>
                <span className="cs-ability-mod">{modFromScore(data.abilities[key].score)}</span>
              </div>
              <div className="cs-ability-save">
                <input
                  type="checkbox"
                  checked={data.abilities[key].saveProf}
                  onChange={(e) =>
                    set({ abilities: { ...data.abilities, [key]: { ...data.abilities[key], saveProf: e.target.checked } } })
                  }
                />
                <span>Спасбросок</span>
                <input
                  className="cs-input"
                  value={data.abilities[key].score}
                  onChange={(e) =>
                    set({ abilities: { ...data.abilities, [key]: { ...data.abilities[key], score: e.target.value } } })
                  }
                />
              </div>
              {SKILL_BY_ABILITY[key].map((sk) => (
                <div key={sk} className="cs-skill-row">
                  <input
                    type="checkbox"
                    checked={data.skills[sk]?.proficient ?? false}
                    onChange={(e) =>
                      set({ skills: { ...data.skills, [sk]: { ...data.skills[sk], proficient: e.target.checked } } })
                    }
                  />
                  <span>{SKILL_LABELS[sk]}</span>
                  <input
                    className="cs-input"
                    value={data.skills[sk]?.bonus ?? ""}
                    onChange={(e) => set({ skills: { ...data.skills, [sk]: { ...data.skills[sk], bonus: e.target.value } } })}
                  />
                </div>
              ))}
            </div>
          ))}
        </aside>

        <main className="cs-main-col">
          <div className="cs-stat-strip">
            <SheetField label="Инициатива" value={data.combat.initiative} onChange={(v) => patchCombat({ initiative: v })} className="cs-stat-box" />
            <SheetField label="Скорость" value={data.combat.speed} onChange={(v) => patchCombat({ speed: v })} className="cs-stat-box" />
            <SheetField label="Размер" value={data.combat.size} onChange={(v) => patchCombat({ size: v })} className="cs-stat-box" />
            <SheetField
              label="Пасс. внимание"
              value={data.combat.passivePerception}
              onChange={(v) => patchCombat({ passivePerception: v })}
              className="cs-stat-box"
            />
          </div>

          <SheetSection title="Оружие и атаки" flush>
            <table className="cs-table">
              <thead>
                <tr>
                  <th className="cs-col-name">Название</th>
                  <th className="cs-col-atk">Бонус</th>
                  <th className="cs-col-dmg">Урон</th>
                  <th className="cs-col-notes">Заметки</th>
                </tr>
              </thead>
              <tbody>
                {data.weapons.map((w, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        className="cs-input"
                        value={w.name}
                        onChange={(e) => {
                          const weapons = [...data.weapons];
                          weapons[idx] = { ...w, name: e.target.value };
                          set({ weapons });
                        }}
                      />
                    </td>
                    <td>
                      <input
                        className="cs-input"
                        value={w.atk}
                        onChange={(e) => {
                          const weapons = [...data.weapons];
                          weapons[idx] = { ...w, atk: e.target.value };
                          set({ weapons });
                        }}
                      />
                    </td>
                    <td>
                      <input
                        className="cs-input"
                        value={w.damage}
                        onChange={(e) => {
                          const weapons = [...data.weapons];
                          weapons[idx] = { ...w, damage: e.target.value };
                          set({ weapons });
                        }}
                      />
                    </td>
                    <td>
                      <input
                        className="cs-input"
                        value={w.notes}
                        onChange={(e) => {
                          const weapons = [...data.weapons];
                          weapons[idx] = { ...w, notes: e.target.value };
                          set({ weapons });
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SheetSection>

          <div className="cs-hit-dice-grid">
            <SheetField label="Кости хитов (потр.)" value={data.hp.hitDiceSpent} onChange={(v) => patchHp({ hitDiceSpent: v })} />
            <SheetField label="Кости хитов (макс.)" value={data.hp.hitDiceMax} onChange={(v) => patchHp({ hitDiceMax: v })} />
          </div>

          <div className="cs-death-box">
            <span className="cs-field-label">Спасброски от смерти</span>
            <DeathSaveRow
              label="Успехи"
              count={data.deathSaves.successes}
              onChange={(n) => set({ deathSaves: { ...data.deathSaves, successes: n } })}
            />
            <DeathSaveRow
              label="Провалы"
              count={data.deathSaves.failures}
              onChange={(n) => set({ deathSaves: { ...data.deathSaves, failures: n } })}
            />
          </div>

          <div className="cs-features-grid">
            <SheetArea label="Особенности класса" value={data.classFeatures} onChange={(v) => set({ classFeatures: v })} rows={7} grow />
            <SheetArea label="Черты вида" value={data.speciesTraits} onChange={(v) => set({ speciesTraits: v })} rows={7} grow />
            <SheetArea label="Черты / feats" value={data.feats} onChange={(v) => set({ feats: v })} rows={7} grow />
          </div>
        </main>
      </div>
    </SheetPage>
  );
}
