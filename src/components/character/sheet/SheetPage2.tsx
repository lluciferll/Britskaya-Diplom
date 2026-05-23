"use client";

import type { CharacterSheetData } from "@/lib/characterSheet/types";
import { SheetArea, SheetField, SheetPage, SheetSection } from "./sheetUi";
import { SpellTable } from "./SpellTable";

type Props = {
  data: CharacterSheetData;
  set: (patch: Partial<CharacterSheetData>) => void;
};

export function SheetPage2({ data, set }: Props) {
  const sc = data.spellcasting;
  const patchSc = (patch: Partial<typeof sc>) => set({ spellcasting: { ...sc, ...patch } });

  return (
    <SheetPage className="cs-page--p2">
      <section className="cs-page2-grid">
        <aside className="cs-section cs-page2-col">
          <header className="cs-section-title">Заклинания</header>
          <section className="cs-section-body cs-page2-stats">
            <SheetField label="Хар. заклинаний" value={sc.ability} onChange={(v) => patchSc({ ability: v })} />
            <SheetField label="Модификатор" value={sc.modifier} onChange={(v) => patchSc({ modifier: v })} />
            <SheetField label="КС спасброска" value={sc.saveDc} onChange={(v) => patchSc({ saveDc: v })} />
            <SheetField label="Бонус атаки" value={sc.attackBonus} onChange={(v) => patchSc({ attackBonus: v })} />
            <section className="cs-slots-grid">
              <span className="cs-field-label">Ячейки заклинаний</span>
              <div className="cs-slot-row cs-slot-head">
                <span />
                <span>всего</span>
                <span>потр.</span>
              </div>
              {Array.from({ length: 9 }).map((_, i) => (
                <section key={i} className="cs-slot-row">
                  <span>{i + 1}</span>
                  <input
                    className="cs-input"
                    value={sc.slotsTotal[i] ?? ""}
                    onChange={(e) => {
                      const slotsTotal = [...sc.slotsTotal];
                      slotsTotal[i] = e.target.value;
                      patchSc({ slotsTotal });
                    }}
                  />
                  <input
                    className="cs-input"
                    value={sc.slotsUsed[i] ?? ""}
                    onChange={(e) => {
                      const slotsUsed = [...sc.slotsUsed];
                      slotsUsed[i] = e.target.value;
                      patchSc({ slotsUsed });
                    }}
                  />
                </section>
              ))}
            </section>
          </section>
        </aside>

        <SheetSection title="Заговоры и подготовленные заклинания" flush className="cs-page2-col cs-page2-spells">
          <SpellTable
            rows={data.spells}
            onRowChange={(idx, patch) => {
              const spells = [...data.spells];
              spells[idx] = { ...spells[idx], ...patch };
              set({ spells });
            }}
          />
        </SheetSection>

        <aside className="cs-section cs-page2-col cs-page2-sidebar">
          <header className="cs-section-title">Персонаж</header>
          <section className="cs-section-body cs-page2-sidebar-body">
            <SheetArea
              label="Внешность"
              value={data.appearance}
              onChange={(v) => set({ appearance: v })}
              rows={4}
              className="cs-page2-area cs-page2-area--appearance"
            />
            <SheetArea
              label="Языки"
              value={data.languages}
              onChange={(v) => set({ languages: v })}
              rows={2}
              className="cs-page2-area cs-page2-area--languages"
            />
            <SheetArea
              label="Снаряжение"
              value={data.equipment}
              onChange={(v) => set({ equipment: v })}
              rows={4}
              className="cs-page2-area cs-page2-area--equipment"
            />
            <section className="cs-page2-meta">
              <SheetField
                label="Мировоззрение"
                value={data.meta.alignment}
                onChange={(v) => set({ meta: { ...data.meta, alignment: v } })}
              />
              <section className="cs-coins-row">
                {(
                  [
                    ["cp", "ММ"],
                    ["sp", "СМ"],
                    ["ep", "ЭМ"],
                    ["gp", "ЗМ"],
                    ["pp", "ПМ"],
                  ] as const
                ).map(([key, label]) => (
                  <section key={key} className="cs-coin">
                    <span className="cs-field-label">{label}</span>
                    <input
                      className="cs-input"
                      value={data.coins[key]}
                      onChange={(e) => set({ coins: { ...data.coins, [key]: e.target.value } })}
                    />
                  </section>
                ))}
              </section>
            </section>
          </section>
        </aside>
      </section>
    </SheetPage>
  );
}
