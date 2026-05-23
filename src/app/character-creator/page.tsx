"use client";

import Link from "next/link";
import { CharacterSheetWorkspace } from "@/components/character/CharacterSheetWorkspace";
import { ForgePage } from "@/components/ForgePage";

export default function CharacterCreatorPage() {
  return (
    <ForgePage title="Конструктор персонажа" kicker="D&D 5e" subtitle="Листы P1–P3, экспорт в PNG.">
      <div className="mx-auto max-w-[min(100%,96rem)] space-y-6 pb-16">
        <p className="forge-muted text-[13px] leading-relaxed">
          Русское название раздела — <strong className="text-[var(--tt-fg)]">«Конструктор персонажа»</strong>. Для кампании добавьте готового героя на вкладке «Персонажи» (тип PC).
        </p>

        <div className="flex flex-wrap gap-2">
          <Link href="/campaigns" className="forge-btn-outline text-[11px] normal-case">
            К кампаниям
          </Link>
        </div>

        <CharacterSheetWorkspace />
      </div>
    </ForgePage>
  );
}
