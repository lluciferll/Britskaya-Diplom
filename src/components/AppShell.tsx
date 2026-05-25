"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { AuthToolbar } from "@/components/AuthToolbar";
import { PreviewBanner } from "@/components/PreviewBanner";
import { CommandPalette } from "@/components/CommandPalette";

const NAV = [
  { href: "/", label: "Главная" },
  { href: "/campaigns", label: "Кампании" },
  { href: "/lore", label: "Справка" },
  { href: "/tools", label: "За столом" },
  { href: "/generators", label: "Генераторы" },
];

function normalizePath(pathname: string | null): string {
  if (!pathname) return "/";
  const clean = pathname.split("?")[0] ?? pathname;
  if (clean.startsWith("/campaigns/") && clean !== "/campaigns") return "/campaigns/:id";
  if (clean.startsWith("/session/")) return "/session/:id";
  if (clean.startsWith("/maps/")) return "/maps/:id";
  if (clean.startsWith("/generators/")) return "/generators";
  if (clean.startsWith("/character-creator")) return "/character-creator";
  if (clean.startsWith("/atlas")) return "/atlas";
  if (clean.startsWith("/tools")) return "/tools";
  if (clean === "/reference") return "/tools";
  return clean;
}

export type Crumb = { href: string; label: string };

export function AppShell({
  title,
  kicker,
  subtitle,
  breadcrumb,
  children,
}: {
  title: string;
  kicker?: string;
  /** Короткая подсказка под заголовком: зачем этот экран */
  subtitle?: string;
  /** Предковые разделы (текущая страница в заголовке, сюда не включать) */
  breadcrumb?: Crumb[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = useMemo(() => normalizePath(pathname), [pathname]);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCmdK = (e.key === "k" || e.key === "к") && (e.metaKey || e.ctrlKey);
      if (isCmdK) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-dvh">
      <PreviewBanner />
      <header className="forge-topbar">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <div className="forge-nav-scroll">
          <nav className="forge-nav-row text-[10px] sm:text-[11px]" aria-label="Основные разделы">
            {NAV.map((item) => {
              const isActive =
                active === item.href || (item.href !== "/" && (pathname ?? "").startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={isActive ? "forge-nav-btn forge-nav-btn-active" : "forge-nav-btn"}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <AuthToolbar />
              <button
                type="button"
                className="forge-nav-btn"
                onClick={() => setPaletteOpen(true)}
                title="Быстрый переход: Ctrl или ⌘ + K"
                aria-label="Поиск по разделам, сочетание клавиш Control K"
              >
                Поиск
              </button>
            </div>
          </nav>
          </div>

          <div className="py-6 sm:py-8 md:py-10">
            <div className="min-w-0 max-w-3xl">
              <p className="forge-kicker">{kicker ?? "MASTER FORGE"}</p>
              {breadcrumb && breadcrumb.length > 0 && (
                <nav className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em]" aria-label="Путь назад по разделам">
                  {breadcrumb.map((c, idx) => (
                    <span key={`${c.href}-${idx}`} className="inline-flex items-center gap-3">
                      {idx > 0 ? <span className="text-[var(--tt-line-strong)] select-none">·</span> : null}
                      <Link href={c.href} className="forge-muted underline underline-offset-[3px] decoration-[var(--tt-line)] hover:text-[var(--tt-fg)]">
                        {c.label}
                      </Link>
                    </span>
                  ))}
                </nav>
              )}
              <h1 className={`forge-page-title text-balance ${breadcrumb?.length ? "mt-4" : "mt-3"}`}>{title}</h1>
              {subtitle ? <p className="forge-muted mt-3 max-w-2xl text-[13px] leading-relaxed">{subtitle}</p> : null}
            </div>
          </div>
        </div>
      </header>

      <main className="forge-main">{children}</main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
