"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DEMO_EMAIL_DEFAULT, getDemoEntryPath, isDemoAccessEnabled } from "@/lib/demoAccess";

function DemoPageInner() {
  const searchParams = useSearchParams();
  const err = searchParams.get("error");
  const [status, setStatus] = useState<"loading" | "error">(err ? "error" : "loading");

  useEffect(() => {
    if (err) return;
    const next = searchParams.get("next");
    const q = next && next.startsWith("/") ? `?next=${encodeURIComponent(next)}` : "";
    window.location.replace(`/api/demo-login${q}`);
  }, [err, searchParams]);

  return (
    <AppShell
      title="Демо-доступ"
      kicker="Проверка проекта"
      breadcrumb={[
        { href: "/", label: "Главная" },
        { href: "/obzor", label: "Обзор" },
      ]}
      subtitle="Автоматический вход в тестовый аккаунт для комиссии, рецензентов и нейросетей с браузером."
    >
      <div className="forge-sheet mt-6 max-w-lg space-y-4 p-6 text-sm leading-relaxed">
        {status === "loading" && !err ? (
          <p className="forge-muted">Входим в демо-аккаунт…</p>
        ) : null}
        {err ? (
          <>
            <p className="font-medium text-[var(--tt-fg)]">Не удалось войти в демо</p>
            <p className="forge-muted text-[12px]">{err}</p>
            <p className="forge-muted text-[12px]">
              Создайте пользователя в Supabase: Authentication → Users → Add user — e-mail{" "}
              <code className="text-[var(--tt-fg)]">{DEMO_EMAIL_DEFAULT}</code>, пароль как в{" "}
              <code className="text-[var(--tt-fg)]">.env</code> (<code>DEMO_PASSWORD</code>).
            </p>
          </>
        ) : null}
        <p className="forge-muted text-[12px]">
          Текстовый обзор без входа:{" "}
          <Link href="/obzor" className="underline underline-offset-2">
            /obzor
          </Link>
          . Обычный вход:{" "}
          <Link href="/login" className="underline underline-offset-2">
            /login
          </Link>
          .
        </p>
      </div>
    </AppShell>
  );
}

export default function DemoPage() {
  if (!isDemoAccessEnabled()) {
    return (
      <AppShell title="Демо-доступ" kicker="Проверка" subtitle="Демо-вход отключён администратором.">
        <p className="forge-muted mt-6 text-sm">
          <Link href="/obzor" className="underline underline-offset-2">
            Обзор проекта
          </Link>{" "}
          доступен без входа.
        </p>
      </AppShell>
    );
  }

  return (
    <Suspense fallback={<p className="forge-muted mt-6 px-1 text-sm">Загрузка…</p>}>
      <DemoPageInner />
    </Suspense>
  );
}
