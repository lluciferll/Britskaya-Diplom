"use client";

import type { SpellRow } from "@/lib/characterSheet/types";
import { DiamondToggle } from "./sheetUi";

type Props = {
  rows: SpellRow[];
  onRowChange: (idx: number, patch: Partial<SpellRow>) => void;
};

export function SpellTable({ rows, onRowChange }: Props) {
  return (
    <table className="cs-table">
      <thead>
        <tr>
          <th className="cs-col-lvl">Ур.</th>
          <th className="cs-col-spell-name">Название</th>
          <th className="cs-col-time">Время</th>
          <th className="cs-col-range">Дист.</th>
          <th className="cs-col-crm">C / R / M</th>
          <th className="cs-col-spell-notes">Заметки</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((sp, idx) => (
          <tr key={idx}>
            <td>
              <input
                className="cs-input"
                value={sp.level}
                onChange={(e) => onRowChange(idx, { level: e.target.value })}
              />
            </td>
            <td>
              <input
                className="cs-input"
                value={sp.name}
                onChange={(e) => onRowChange(idx, { name: e.target.value })}
              />
            </td>
            <td>
              <input
                className="cs-input"
                value={sp.castingTime}
                onChange={(e) => onRowChange(idx, { castingTime: e.target.value })}
              />
            </td>
            <td>
              <input
                className="cs-input"
                value={sp.range}
                onChange={(e) => onRowChange(idx, { range: e.target.value })}
              />
            </td>
            <td>
              <div className="cs-crm-cell">
                <DiamondToggle
                  label="C"
                  checked={sp.concentration}
                  onChange={(v) => onRowChange(idx, { concentration: v })}
                />
                <DiamondToggle label="R" checked={sp.ritual} onChange={(v) => onRowChange(idx, { ritual: v })} />
                <DiamondToggle label="M" checked={sp.material} onChange={(v) => onRowChange(idx, { material: v })} />
              </div>
            </td>
            <td>
              <input
                className="cs-input"
                value={sp.notes}
                onChange={(e) => onRowChange(idx, { notes: e.target.value })}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
