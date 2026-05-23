"use client";

import { useMemo } from "react";
import {
  AIDEDD_ATLAS_HOME,
  AIDEDD_ATLAS_OPTIONS,
  type AideddAtlasKey,
  getAideddAtlasOption,
} from "@/lib/aideddAtlas";

type Props = {
  atlasKey: AideddAtlasKey;
  onAtlasKeyChange: (key: AideddAtlasKey) => void;
};

export function FaerunAtlasPanel({ atlasKey, onAtlasKeyChange }: Props) {
  const option = useMemo(() => getAideddAtlasOption(atlasKey), [atlasKey]);

  return (
    <div className="space-y-5">
      <p className="text-[12px] forge-muted">
        Атлас{" "}
        <a href="https://www.aidedd.org/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          Aidedd
        </a>
        . Если рамка пустая — откройте карту в новой вкладке.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {AIDEDD_ATLAS_OPTIONS.map((opt) => {
          const active = opt.key === atlasKey;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onAtlasKeyChange(opt.key)}
              className={
                active
                  ? "forge-inset border-2 border-[var(--tt-fg)] p-3 text-left"
                  : "forge-inset border border-dotted border-[var(--tt-line)] p-3 text-left transition hover:border-[var(--tt-line-strong)]"
              }
            >
              <span className="forge-label normal-case tracking-normal text-[var(--tt-fg)]">{opt.labelRu}</span>
              <span className="mt-2 block text-[11px] leading-snug forge-muted">{opt.subtitle}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={option.url}
          target="_blank"
          rel="noopener noreferrer"
          className="forge-btn-gold inline-flex text-[11px] normal-case"
        >
          Открыть «{option.labelRu}» на aidedd.org
        </a>
        <a
          href={AIDEDD_ATLAS_HOME}
          target="_blank"
          rel="noopener noreferrer"
          className="forge-btn-outline inline-flex text-[11px] normal-case"
        >
          Каталог всех атласов Aidedd
        </a>
      </div>

      <div className="overflow-hidden rounded border border-dotted border-[var(--tt-line-strong)] bg-[#1a1814]">
        <iframe
          key={option.url}
          title={`Aidedd Atlas — ${option.labelRu}`}
          className="h-[min(78vh,820px)] w-full border-0"
          src={option.url}
          loading="lazy"
          allow="fullscreen"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox"
        />
      </div>

      <p className="text-[10px] uppercase tracking-[0.14em] forge-muted">
        Карты и описания © их авторы и правообладатели (Wizards of the Coast / Forgotten Realms и др.). Aidedd — независимый справочник.
      </p>
    </div>
  );
}
