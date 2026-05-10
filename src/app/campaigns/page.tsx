"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { downloadTextFile } from "@/lib/campaignBackup";
import { useForgeStore } from "@/store/useForgeStore";

export default function CampaignsPage() {
  const router = useRouter();
  const campaigns = useForgeStore((s) => s.campaigns);
  const createCampaign = useForgeStore((s) => s.createCampaign);
  const exportBackupJson = useForgeStore((s) => s.exportBackupJson);
  const importBackupJson = useForgeStore((s) => s.importBackupJson);
  const [title, setTitle] = useState("");
  const [impMsg, setImpMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const sorted = useMemo(
    () => [...campaigns].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [campaigns],
  );

  return (
    <AppShell
      title="Все кампании"
      kicker="Центральный список"
      subtitle="Каждая строка — ваша живая кампания: вкладки мира и кнопка на стол мастера. Регулярно скачивайте JSON, если чистите кэш браузера."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <section id="campaign-import" className="forge-sheet scroll-mt-28 p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Список</h2>
              <p className="forge-muted mt-2 text-sm leading-relaxed">
                По строке переходите в карточку кампании. Резервные копии — кнопками ниже: «скачать всё» до чистки кэша или миграции.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="forge-btn-outline px-3 py-2 text-xs"
                  onClick={() =>
                    downloadTextFile(`master-forge-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`, exportBackupJson())
                  }
                >
                  Скачать все кампании (JSON)
                </button>
                <button type="button" className="forge-btn-outline px-3 py-2 text-xs" onClick={() => fileRef.current?.click()}>
                  Импорт файла…
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    setImpMsg(null);
                    if (!f) return;
                    try {
                      const text = await f.text();
                      const mode =
                        typeof window !== "undefined" && window.confirm("Заменить все кампании данными из файла? Отмена = слить существующее и новое по id.")
                          ? "replace"
                          : "merge";
                      const r = importBackupJson(text, mode);
                      if (!r.ok) setImpMsg({ kind: "err", text: r.error });
                      else setImpMsg({ kind: "ok", text: `Импортировано записей: ${r.imported} (${mode === "replace" ? "замена" : "слияние"})` });
                    } catch {
                      setImpMsg({ kind: "err", text: "Не удалось прочитать файл." });
                    }
                  }}
                />
              </div>
              {impMsg && (
                <p className={`mt-3 text-xs ${impMsg.kind === "ok" ? "forge-msg-ok font-medium" : "forge-msg-err font-medium"}`}>{impMsg.text}</p>
              )}
            </div>
          </div>

          <div className="mt-6 overflow-hidden border border-dotted border-[var(--tt-line-strong)]">
            {sorted.length === 0 && <div className="forge-muted px-6 py-6 text-sm">Пока пусто — создайте первую кампанию справа.</div>}
            {sorted.map((c) => (
              <Link
                key={c.id}
                href={`/campaigns/${c.id}`}
                className="forge-row border-t border-dotted border-[var(--tt-line)] first:border-t-0 hover:bg-[rgba(10,10,10,0.04)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-[var(--tt-fg)]">{c.title}</div>
                    <div className="forge-muted mt-1 text-xs">
                      {c.system} · Ур. партии {c.partyLevel} · Тон: {c.tone}
                    </div>
                  </div>
                  <span className="forge-muted shrink-0 text-xs">
                    Обновлено{" "}
                    {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(c.updatedAt))}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="forge-sheet p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] forge-muted">Новая кампания</h3>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const id = createCampaign(title);
              setTitle("");
              router.push(`/campaigns/${id}`);
            }}
          >
            <label className="block">
              <span className="forge-label">Название</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Мрак Утёса" className="forge-field mt-2" required />
            </label>
            <button type="submit" className="forge-btn-gold w-full">
              Создать
            </button>
          </form>

          <div className="forge-inset mt-6 text-xs forge-muted leading-relaxed">
            Резерв JSON, генератор города, сессионный стол с таймером и кубиками, калькулятор столкновения.
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
