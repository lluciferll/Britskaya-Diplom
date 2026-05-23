"use client";

import { useMemo } from "react";
import type { WatabouCityParams } from "@/lib/watabouCityUrl";
import { buildWatabouCityUrl, randomWatabouSeed } from "@/lib/watabouCityUrl";

type Props = {
  params: WatabouCityParams;
  onChange: (next: WatabouCityParams) => void;
};

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[12px] forge-text-soft">
      <input type="checkbox" className="forge-check" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function WatabouCityPanel({ params: p, onChange }: Props) {
  const iframeSrc = useMemo(() => buildWatabouCityUrl(p), [p]);

  const set = (patch: Partial<WatabouCityParams>) => onChange({ ...p, ...patch });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          <span className="forge-label">Размер города</span>
          <input
            type="number"
            min={5}
            max={50}
            value={p.size}
            onChange={(e) => set({ size: Math.max(5, Math.min(50, Number(e.target.value) || p.size)) })}
            className="forge-field mt-2"
          />
        </label>
        <label className="text-sm md:col-span-1">
          <span className="forge-label">Seed (раскладка)</span>
          <input
            type="number"
            value={p.seed}
            onChange={(e) => set({ seed: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
            className="forge-field mt-2 font-mono text-xs"
          />
        </label>
        <label className="text-sm">
          <span className="forge-label">Ворота (gates, −1 авто)</span>
          <input
            type="number"
            min={-1}
            max={8}
            value={p.gates}
            onChange={(e) => set({ gates: Math.max(-1, Math.min(8, Number(e.target.value) || 0)) })}
            className="forge-field mt-2"
          />
        </label>
        <div className="flex flex-col justify-end gap-2">
          <button type="button" className="forge-btn-outline text-[11px] normal-case" onClick={() => set({ seed: randomWatabouSeed() })}>
            Новый случайный seed
          </button>
          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="forge-btn-gold inline-flex justify-center text-[11px] normal-case"
          >
            Открыть тот же URL отдельно
          </a>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Toggle label="Цитадель (citadel)" checked={p.citadel === 1} onChange={(v) => set({ citadel: v ? 1 : 0 })} />
        <Toggle label="Городской замок (urban castle)" checked={p.urban_castle === 1} onChange={(v) => set({ urban_castle: v ? 1 : 0 })} />
        <Toggle label="Плаза (plaza)" checked={p.plaza === 1} onChange={(v) => set({ plaza: v ? 1 : 0 })} />
        <Toggle label="Храм (temple)" checked={p.temple === 1} onChange={(v) => set({ temple: v ? 1 : 0 })} />
        <Toggle label="Стены (walls)" checked={p.walls === 1} onChange={(v) => set({ walls: v ? 1 : 0 })} />
        <Toggle label="Трущобы (shantytown)" checked={p.shantytown === 1} onChange={(v) => set({ shantytown: v ? 1 : 0 })} />
        <Toggle label="Берег (coast)" checked={p.coast === 1} onChange={(v) => set({ coast: v ? 1 : 0 })} />
        <Toggle label="Река (river)" checked={p.river === 1} onChange={(v) => set({ river: v ? 1 : 0 })} />
        <Toggle label="Зелень (greens)" checked={p.greens === 1} onChange={(v) => set({ greens: v ? 1 : 0 })} />
      </div>

      <p className="text-[11px] leading-relaxed forge-muted">
        Инструмент —{" "}
        <a className="underline underline-offset-2" href="https://github.com/watabou" target="_blank" rel="noopener noreferrer">
          watabou
        </a>
        . Если превью пустое — «Открыть тот же URL».
      </p>

      <div className="overflow-hidden rounded border border-dotted border-neutral-700 bg-neutral-950/20">
        <iframe
          title="Генератор города Watabou"
          className="h-[min(72vh,720px)] w-full border-0"
          src={iframeSrc}
          loading="lazy"
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
