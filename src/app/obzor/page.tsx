import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PREVIEW_ENTER_PATH } from "@/lib/previewMode";

/**
 * Публичная страница без авторизации — для нейросетей и проверяющих,
 * которые не выполняют JavaScript и не проходят форму входа.
 */
export default function ObzorPage() {
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
          <h2 className="forge-label">Как открыть весь интерфейс без регистрации</h2>
          <p className="forge-muted mt-3">
            Режим предпросмотра не использует Supabase: одна ссылка включает cookie и открывает приложение с демо-кампанией.
          </p>
          <p className="mt-4 font-mono text-[13px] text-[var(--tt-fg)]">
            <Link href={PREVIEW_ENTER_PATH} className="underline underline-offset-2">
              {PREVIEW_ENTER_PATH}
            </Link>
          </p>
          <p className="forge-muted mt-3 text-[12px]">
            Для ChatGPT с браузером: откройте эту ссылку, затем переходите по разделам (Кампании, Справка, Генераторы и т.д.).
            Страница <code>/login</code> — только регистрация; предпросмотр — по ссылке выше.
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
          <Link href={PREVIEW_ENTER_PATH} className="underline underline-offset-2">
            Предпросмотр
          </Link>
        </p>
      </article>
    </AppShell>
  );
}
