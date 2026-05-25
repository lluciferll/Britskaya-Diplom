"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DEMO_EMAIL_DEFAULT, DEMO_PASSWORD_DEFAULT, getDemoEntryPath, isDemoAccessEnabled } from "@/lib/demoAccess";
import { getPublicAppOrigin } from "@/lib/appOrigin";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session?.user) {
        router.replace("/campaigns");
        return;
      }
      setCheckingSession(false);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);
    const supabase = createClient();
    const origin = getPublicAppOrigin();
    if (!origin) {
      setError("Не задан публичный адрес приложения: укажите NEXT_PUBLIC_SITE_URL в .env (например http://localhost:3050 для Docker).");
      setPending(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${origin}/auth/callback` },
        });
        if (err) {
          setError(err.message);
          return;
        }
        if (data.session) {
          router.push("/campaigns");
          router.refresh();
          return;
        }
        setMessage(
          "Если в проекте включено подтверждение почты — проверьте ящик и перейдите по ссылке. После этого можно снова открыть сайт.",
        );
        return;
      }

      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) {
        setError(err.message);
        return;
      }
      router.push("/campaigns");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <AppShell
      title="Вход"
      kicker="Аккаунт"
      breadcrumb={[{ href: "/", label: "Главная" }]}
      subtitle="Регистрация и вход по e-mail и паролю (настройки — в Supabase). После входа сессия хранится в cookie браузера."
    >
      {checkingSession ? (
        <p className="forge-muted mt-6 text-sm">Проверяем сессию…</p>
      ) : (
      <div className="mt-6 max-w-md space-y-6">
        <div className="flex gap-2">
          <button
            type="button"
            className={mode === "signin" ? "forge-btn-gold" : "forge-btn-outline"}
            onClick={() => {
              setMode("signin");
              setError(null);
              setMessage(null);
            }}
          >
            Вход
          </button>
          <button
            type="button"
            className={mode === "signup" ? "forge-btn-gold" : "forge-btn-outline"}
            onClick={() => {
              setMode("signup");
              setError(null);
              setMessage(null);
            }}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="forge-sheet space-y-4 p-6">
          <label className="block text-sm">
            <span className="forge-label">E-mail</span>
            <input
              type="email"
              autoComplete="email"
              required
              className="forge-field mt-2 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="forge-label">Пароль</span>
            <input
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={6}
              className="forge-field mt-2 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="forge-muted mt-2 block text-[11px]">Минимум 6 символов (политика задаётся в Supabase).</span>
          </label>

          {error ? (
            <p className="rounded border border-[var(--tt-line-strong)] bg-black/20 px-3 py-2 text-[12px] text-[var(--tt-fg)]">{error}</p>
          ) : null}
          {message ? <p className="forge-muted text-[12px] leading-relaxed">{message}</p> : null}

          <button type="submit" className="forge-btn-gold w-full" disabled={pending}>
            {pending ? "…" : mode === "signup" ? "Создать аккаунт" : "Войти"}
          </button>
        </form>

        {isDemoAccessEnabled() ? (
          <div className="forge-sheet space-y-3 p-5">
            <p className="forge-label">Демо для проверки (диплом)</p>
            <p className="forge-muted text-[12px] leading-relaxed">
              Без регистрации — для комиссии и нейросетей с браузером. Текстовый обзор без входа:{" "}
              <Link href="/obzor" className="text-[var(--tt-fg)] underline underline-offset-2">
                /obzor
              </Link>
              .
            </p>
            <p className="font-mono text-[11px] text-[var(--tt-fg)]">
              {DEMO_EMAIL_DEFAULT} · пароль: {DEMO_PASSWORD_DEFAULT}
            </p>
            <Link href={getDemoEntryPath()} className="forge-btn-gold inline-block px-4 py-2 text-[11px] normal-case tracking-normal">
              Войти в демо одним кликом
            </Link>
          </div>
        ) : null}

        <p className="forge-muted text-[12px]">
          <Link href="/" className="underline underline-offset-2">
            На главную
          </Link>
          {" · "}
          <Link href="/obzor" className="underline underline-offset-2">
            Обзор проекта
          </Link>
        </p>
      </div>
      )}
    </AppShell>
  );
}
