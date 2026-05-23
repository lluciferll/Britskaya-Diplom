"use client";

import type { ReactNode } from "react";

export function modFromScore(score: string): string {
  const n = Number(score);
  if (!Number.isFinite(n)) return "—";
  const m = Math.floor((n - 10) / 2);
  return m >= 0 ? `+${m}` : String(m);
}

export function SheetPage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`cs-page ${className}`.trim()}>{children}</div>;
}

export function SheetField({
  label,
  value,
  onChange,
  className = "",
  inputClassName = "",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}) {
  return (
    <label className={`cs-field ${className}`}>
      <span className="cs-field-label">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`cs-input ${inputClassName}`}
      />
    </label>
  );
}

export function SheetArea({
  label,
  value,
  onChange,
  rows = 5,
  className = "",
  grow = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  className?: string;
  grow?: boolean;
}) {
  return (
    <label className={`cs-field ${grow ? "cs-field-grow" : ""} ${className}`}>
      <span className="cs-field-label">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={grow ? "cs-textarea" : "cs-textarea cs-textarea-fixed"}
      />
    </label>
  );
}

export function SheetSection({
  title,
  children,
  className = "",
  flush = false,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section className={`cs-section ${className}`}>
      <header className="cs-section-title">{title}</header>
      <div className={flush ? "cs-section-body cs-section-body-flush" : "cs-section-body"}>{children}</div>
    </section>
  );
}

export function DiamondToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="cs-diamond-btn"
      title={label}
    >
      <span className={`cs-diamond ${checked ? "cs-diamond-on" : ""}`} />
      <span className="cs-diamond-label">{label}</span>
    </button>
  );
}

export function DeathSaveRow({
  label,
  count,
  onChange,
}: {
  label: string;
  count: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="cs-death-row">
      <span className="cs-death-label">{label}</span>
      <div className="cs-death-diamonds">
        {Array.from({ length: 3 }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${label} ${i + 1}`}
            onClick={() => onChange(i + 1 === count ? i : i + 1)}
            className={`cs-diamond ${i < count ? "cs-diamond-on" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
