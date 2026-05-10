"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
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
    <AppShell
      title="Генератор лавки"
      kicker="Торговля для мира вашей экономики"
      breadcrumb={[{ href: "/generators", label: "Генераторы" }]}
      subtitle="Генерирует импульс ассортимента и текстовые зацепки — не воспроизводит авторские таблицы магической торговли. Редкость магических вещей калибруйте вручную по своей кампании."
    >
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
          Для интеграции с инвентарём партии используйте вкладку «Партия · книги» внутри кампании — журнал лута и выдачу предметов фиксируйте там же текстом.
        </p>
      </div>
    </AppShell>
  );
}
