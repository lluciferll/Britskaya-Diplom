"use client";

import { useState } from "react";
import { ForgePage } from "@/components/ForgePage";
import { generateShopInventory, type SettlementSize } from "@/lib/shop";

const SIZES: { key: SettlementSize; label: string }[] = [
  { key: "hamlet", label: "Хутор / малый торг" },
  { key: "village", label: "Деревня / речной причал" },
  { key: "town", label: "Укрупнённое поселение" },
  { key: "city", label: "Городские укрепления" },
  { key: "metropolis", label: "Мегаполис / узел караванов" },
];

export default function ShopGeneratorPage() {
  const [size, setSize] = useState<SettlementSize>("town");
  const [pack, setPack] = useState(() => generateShopInventory(size));

  return (
    <ForgePage title="Лавка / рынок" kicker="Торговля" subtitle="Ассортимент по размеру поселения.">
      <div className="forge-sheet max-w-3xl space-y-6 p-6">
        <label className="block text-sm">
          <span className="forge-label">Размер поселения</span>
          <select value={size} onChange={(e) => setSize(e.target.value as SettlementSize)} className="forge-field mt-2">
            {SIZES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="forge-btn-gold px-6" onClick={() => setPack(generateShopInventory(size))}>
          Сгенерировать ассортимент
        </button>
        <div className="forge-inset p-5">
          <h2 className="tt-display text-2xl text-[var(--tt-fg)]">{pack.summary}</h2>
          <ul className="forge-text-soft mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed marker:text-[var(--tt-muted)]">
            {pack.lines.map((ln) => (
              <li key={ln}>{ln}</li>
            ))}
          </ul>
        </div>
        <p className="forge-muted text-[11px] leading-relaxed">
          Инвентарь персонажей — в «Заметках мастера» на вкладке «Персонажи»; журнал наград кампании — в «Обзоре» карточки кампании.
        </p>
      </div>
    </ForgePage>
  );
}
