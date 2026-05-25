"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PREVIEW_EXIT_PATH, isPreviewModeClient } from "@/lib/previewMode";

export function PreviewBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isPreviewModeClient());
  }, []);

  if (!active) return null;

  return (
    <div
      className="border-b border-dotted border-[var(--tt-line-strong)] bg-[rgba(10,10,10,0.06)] px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--tt-fg)]"
      role="status"
    >
      Режим предпросмотра — без регистрации и облака, данные только в этом браузере.{" "}
      <Link href={PREVIEW_EXIT_PATH} className="underline underline-offset-2">
        Выйти
      </Link>
      {" · "}
      <Link href="/login" className="underline underline-offset-2">
        Войти в аккаунт
      </Link>
    </div>
  );
}
