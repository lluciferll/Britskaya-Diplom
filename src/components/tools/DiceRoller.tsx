"use client";

import { useState } from "react";
import type { DiceRollEntry } from "@/domain/types";
import { evaluateDiceExpression, rollD20WithModifier, type D20Mode } from "@/lib/dice";
import { useForgeStore } from "@/store/useForgeStore";

function pushRoll(
  append: ((campaignId: string, roll: Omit<DiceRollEntry, "id">) => void) | undefined,
  campaignId: string | undefined,
  result: { formula: string; detail: string; total: number },
  label?: string,
): void {
  if (!campaignId || !append) return;
  append(campaignId, {
    rolledAt: new Date().toISOString(),
    label,
    formula: result.formula,
    detail: result.detail,
    total: result.total,
  });
}

type Props = {
  campaignId?: string;
  variant?: "full" | "compact";
};

export function DiceRoller({ campaignId, variant = "full" }: Props) {
  const appendDiceRoll = useForgeStore((s) => s.appendDiceRoll);
  const [expr, setExpr] = useState("1d20+5");
  const [d20Mod, setD20Mod] = useState(0);
  const [d20Mode, setD20Mode] = useState<D20Mode>("normal");
  const [last, setLast] = useState<{ formula: string; total: number; detail: string } | null>(null);
  const [err, setErr] = useState<string>("");

  const presets = ["1d20", "2d6", "4d6", "1d8+3", "2d8+8", "1d100"];

  function onRollExpression() {
    setErr("");
    try {
      const r = evaluateDiceExpression(expr);
      setLast({ formula: r.formula, total: r.total, detail: r.detail });
      pushRoll(appendDiceRoll, campaignId, r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    }
  }

  function onRollD20() {
    setErr("");
    const r = rollD20WithModifier(d20Mod, d20Mode);
    setLast({ formula: r.formula, total: r.total, detail: r.detail });
    pushRoll(appendDiceRoll, campaignId, r);
  }

  const compact = variant === "compact";

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div className="forge-inset p-4">
        <p className="forge-label uppercase tracking-[0.2em]">Формула</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="Например: 2d6+4 или d8+d4+3"
            className="forge-field min-w-[12rem] flex-1 font-mono text-sm"
          />
          <button type="button" className="forge-btn-gold" onClick={onRollExpression}>
            Бросить
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              className="forge-tab px-2 py-1 text-[11px] normal-case tracking-normal"
              onClick={() => setExpr(p)}
            >
              {p}
            </button>
          ))}
        </div>
        {!compact && (
          <p className="forge-muted mt-3 text-[11px] leading-relaxed">
            Цепочка из частей вида «+2d8», «−1d6», «+5». Преимущество/помеха для основного d20 — ниже отдельным блоком.
          </p>
        )}
      </div>

      <div className="forge-inset p-4">
        <p className="forge-label uppercase tracking-[0.2em]">Бросок d20</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="forge-label block">
            Модификатор
            <input
              type="number"
              value={d20Mod}
              onChange={(e) => setD20Mod(Number(e.target.value))}
              className="forge-field mt-1 block w-24 py-2 font-mono"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {(["normal", "advantage", "disadvantage"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setD20Mode(m)}
                className={`px-3 py-2 text-xs normal-case tracking-normal transition ${
                  d20Mode === m ? "forge-tab-active border-solid" : "forge-tab"
                }`}
              >
                {m === "normal" ? "Обычный" : m === "advantage" ? "Преимущество" : "Помеха"}
              </button>
            ))}
          </div>
          <button type="button" className="forge-btn-gold" onClick={onRollD20}>
            d20
          </button>
        </div>
      </div>

      {err && <p className="forge-msg-err text-sm font-medium">{err}</p>}
      {last && (
        <div className="border border-dotted border-[var(--tt-line-strong)] bg-[var(--tt-bg-elev)] px-4 py-3 text-sm forge-text-soft">
          <span className="forge-muted">Последний: </span>
          <span className="font-mono text-[var(--tt-fg)]">
            {last.formula} → <strong>{last.total}</strong>
          </span>
          <span className="forge-muted"> · {last.detail}</span>
        </div>
      )}
    </div>
  );
}
