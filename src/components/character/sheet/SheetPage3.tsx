"use client";

import type { CharacterSheetData } from "@/lib/characterSheet/types";
import { SheetArea, SheetPage, SheetSection } from "./sheetUi";
import { SpellTable } from "./SpellTable";

type Props = {
  data: CharacterSheetData;
  set: (patch: Partial<CharacterSheetData>) => void;
};

export function SheetPage3({ data, set }: Props) {
  return (
    <SheetPage>
      <div className="cs-page3-grid">
        <SheetSection title="Подготовленные заклинания (доп.)" flush>
          <SpellTable
            rows={data.preparedSpellsExtra}
            onRowChange={(idx, patch) => {
              const preparedSpellsExtra = [...data.preparedSpellsExtra];
              preparedSpellsExtra[idx] = { ...preparedSpellsExtra[idx], ...patch };
              set({ preparedSpellsExtra });
            }}
          />
        </SheetSection>
        <SheetArea label="Заметки по магии" value={data.spellNotes} onChange={(v) => set({ spellNotes: v })} rows={32} />
      </div>
    </SheetPage>
  );
}
