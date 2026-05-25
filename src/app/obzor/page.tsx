import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DEMO_EMAIL_DEFAULT, DEMO_PASSWORD_DEFAULT, getDemoEntryPath } from "@/lib/demoAccess";

/**
 * Публичная страница без авторизации — для нейросетей и проверяющих,
 * которые не выполняют JavaScript и не проходят форму входа.
 */
export default function ObzorPage() {
  const demoUrl = getDemoEntryPath();

  return (
    <AppShell
      title="Обзор Master Forge"
      kicker="Диплом · D&D 5e"
      subtitle="Веб-приложение мастера настольных ролевых игр: кампании, справка SRD, генераторы, сессионный стол, карты."
    >
      <article className="mt-6 max-w-3xl space-y-8 text-sm leading-relaxed">
        <section className="forge-sheet p-6">
          <h2 className="forge-label">Назначение</h2>
          <p className="forge-muted mt-3">
            Master Forge — мастерская мастера D&amp;D 5e: подготовка и ведение кампании в одном интерфейсе на русском языке.
            Данные кампаний хранятся в облаке Supabase с изоляцией по пользователю (RLS).
          </p>
        </section>

        <section className="forge-sheet p-6">
          <h2 className="forge-label">Разделы приложения</h2>
          <ul className="forge-muted mt-3 list-inside list-disc space-y-2">
            <li>
              <strong className="text-[var(--tt-fg)]">Главная</strong> — быстрый доступ к последним кампаниям и инструментам без привязки к партии.
            </li>
            <li>
              <strong className="text-[var(--tt-fg)]">Кампании</strong> — создание, импорт/экспорт JSON, карточка кампании (мир, NPC, таймлайн, персонажи, столкновения, карта Watabou, вики, заметки).
            </li>
            <li>
              <strong className="text-[var(--tt-fg)]">Справка</strong> — браузер SRD: заклинания, монстры, черты, божества и др.
            </li>
            <li>
              <strong className="text-[var(--tt-fg)]">За столом</strong> — кубики, калькулятор встречи по XP, генератор добычи, шпаргалка правил.
            </li>
            <li>
              <strong className="text-[var(--tt-fg)]">Генераторы</strong> — NPC, события, emergency, магазин.
            </li>
            <li>
              <strong className="text-[var(--tt-fg)]">Игровой стол</strong> — таймер, кубики, заметки сессии в контексте кампании.
            </li>
            <li>
              <strong className="text-[var(--tt-fg)]">Лист персонажа</strong> — редактор P1–P3, экспорт PNG.
            </li>
            <li>
              <strong className="text-[var(--tt-fg)]">Атлас Faerûn</strong> — интерактивная карта Forgotten Realms.
            </li>
          </ul>
        </section>

        <section className="forge-sheet p-6">
          <h2 className="forge-label">Как открыть интерактивный интерфейс</h2>
          <p className="forge-muted mt-3">
            Основные разделы защищены входом по e-mail (Supabase Auth). Для проверки без регистрации используйте демо-вход:
          </p>
          <p className="mt-4 font-mono text-[13px] text-[var(--tt-fg)]">
            Ссылка:{" "}
            <Link href={demoUrl} className="underline underline-offset-2">
              {demoUrl}
            </Link>
          </p>
          <p className="forge-muted mt-3 text-[12px]">
            Учётная запись по умолчанию: <code>{DEMO_EMAIL_DEFAULT}</code> / <code>{DEMO_PASSWORD_DEFAULT}</code> (создаётся
            один раз в Supabase → Authentication → Users).
          </p>
          <p className="forge-muted mt-3 text-[12px]">
            Нейросети без браузера и cookie могут анализировать этот текстовый обзор. С браузером — откройте ссылку демо-входа
            выше.
          </p>
        </section>

        <section className="forge-sheet p-6">
          <h2 className="forge-label">Технологии</h2>
          <p className="forge-muted mt-3">
            Next.js 15, React 19, TypeScript, Zustand, Supabase (Auth + PostgreSQL), Docker, хостинг Amvera.
          </p>
        </section>

        <p className="forge-muted font-mono text-[10px] uppercase tracking-[0.18em]">
          <Link href="/login" className="underline underline-offset-2">
            Вход
          </Link>
          {" · "}
          <Link href={demoUrl} className="underline underline-offset-2">
            Демо
          </Link>
        </p>
      </article>
    </AppShell>
  );
}
