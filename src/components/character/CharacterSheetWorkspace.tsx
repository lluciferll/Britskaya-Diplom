"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterSheetData } from "@/lib/characterSheet/types";
import { CHARACTER_SHEET_LS_KEY, createEmptyCharacterSheet } from "@/lib/characterSheet/defaults";
import { downloadElementAsPng } from "@/lib/exportElementPng";
import { SheetPage1 } from "./sheet/SheetPage1";
import { SheetPage2 } from "./sheet/SheetPage2";
import { SheetPage3 } from "./sheet/SheetPage3";

export function CharacterSheetWorkspace() {
  const [data, setDataState] = useState<CharacterSheetData>(createEmptyCharacterSheet);
  const [page, setPage] = useState<1 | 2 | 3>(1);
  const [exportMsg, setExportMsg] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHARACTER_SHEET_LS_KEY);
      if (raw) setDataState(JSON.parse(raw) as CharacterSheetData);
    } catch {
      /* ignore */
    }
  }, []);

  const setData = useCallback((patch: Partial<CharacterSheetData>) => {
    setDataState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(CHARACTER_SHEET_LS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  async function exportPng() {
    if (!pageRef.current) return;
    setExportMsg("");
    try {
      const slug = data.meta.name.trim() || "personazh";
      await downloadElementAsPng(pageRef.current, `${slug}-list-p${page}.png`, page === 2 ? 2.5 : 2);
      setExportMsg(`Сохранено: ${slug}-list-p${page}.png`);
    } catch {
      setExportMsg("Не удалось создать PNG — попробуйте другой браузер или уменьшите масштаб страницы.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="forge-inset p-4 text-[12px] forge-muted">
        Листы персонажа D&amp;D 5e (P1–P3): заполняются в браузере, черновик хранится локально. «Скачать PNG» сохраняет текущую страницу как изображение.
      </div>

      <div className="flex flex-wrap gap-2">
        {([1, 2, 3] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPage(p)}
            className={page === p ? "forge-btn-gold text-[11px]" : "forge-btn-outline text-[11px] normal-case"}
          >
            Страница P{p}
          </button>
        ))}
        <button type="button" className="forge-btn-gold text-[11px] normal-case" onClick={() => void exportPng()}>
          Скачать PNG (текущая страница)
        </button>
        <button
          type="button"
          className="forge-btn-outline text-[11px] normal-case"
          onClick={() => {
            const empty = createEmptyCharacterSheet();
            setDataState(empty);
            localStorage.setItem(CHARACTER_SHEET_LS_KEY, JSON.stringify(empty));
          }}
        >
          Очистить лист
        </button>
      </div>

      {exportMsg ? <p className="text-[12px] forge-muted">{exportMsg}</p> : null}

      <p className="text-[11px] forge-muted sm:hidden">На телефоне лист можно прокручивать вбок; для печати удобнее повернуть экран или открыть на компьютере.</p>

      <div ref={pageRef} className="cs-sheet-viewport -mx-1 overflow-x-auto overflow-y-clip rounded border border-dotted border-[var(--tt-line)] bg-neutral-200 p-2 sm:mx-0 sm:p-4">
        {page === 1 && <SheetPage1 data={data} set={setData} />}
        {page === 2 && <SheetPage2 data={data} set={setData} />}
        {page === 3 && <SheetPage3 data={data} set={setData} />}
      </div>
    </div>
  );
}
