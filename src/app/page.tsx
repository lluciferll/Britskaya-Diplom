import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function HomePage() {
  return (
    <AppShell
      title="Master Forge"
      kicker="Мастерская мастера"
      subtitle="Инструмент живого стола для мастера: кампании, справка SRD, кубики и генераторы. Всё хранится в браузере на вашем ноутбуке."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="forge-sheet p-6">
            <h2 className="forge-label mb-6">От общего к частному</h2>
            <ol className="space-y-6 text-sm leading-relaxed">
              <li className="flex gap-4">
                <span className="forge-muted shrink-0 font-mono text-[11px]" aria-hidden>
                  01
                </span>
                <div className="min-w-0">
                  <strong className="text-[var(--tt-fg)]">Кампания</strong>
                  <p className="forge-muted mt-2">
                    Один объект «партия»: метаданные, заметки о мире, лог игр. Внутри вкладки — не трогаете расчёты во время боя отдельно.
                  </p>
                  <div className="mt-4">
                    <Link href="/campaigns" className="forge-btn-gold">
                      Перейти к списку кампаний
                    </Link>
                  </div>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="forge-muted shrink-0 font-mono text-[11px]" aria-hidden>
                  02
                </span>
                <div className="min-w-0">
                  <strong className="text-[var(--tt-fg)]">Игровой стол</strong>
                  <p className="forge-muted mt-2">
                    Сессия (таймер, инициатива и кубики) и карта города Watabou. Открываются из карточки кампании; данные сохраняются там же.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/campaigns" className="forge-btn-outline px-4 py-2">
                      Выбрать кампанию → стол
                    </Link>
                    <Link href="/tools" className="forge-btn-outline px-4 py-2">
                      Кубики без кампании
                    </Link>
                  </div>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="forge-muted shrink-0 font-mono text-[11px]" aria-hidden>
                  03
                </span>
                <div className="min-w-0">
                  <strong className="text-[var(--tt-fg)]">Импровизация</strong>
                  <p className="forge-muted mt-2">
                    NPC, случайное событие и «Emergency» — когда ушли от сценария. Подходит и до игры как подготовка, и между сценами за столом.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/generators" className="forge-btn-outline px-4 py-2">
                      Открыть генераторы
                    </Link>
                    <Link href="/generators/emergency" className="forge-btn-outline px-4 py-2">
                      Emergency-пакет
                    </Link>
                  </div>
                </div>
              </li>
            </ol>
          </section>

          <p className="forge-muted px-1 font-mono text-[10px] uppercase tracking-[0.18em]">
            Комбинация Ctrl или ⌘ + K открывает поиск по разделам с любого экрана
          </p>
        </div>

        <aside className="forge-sheet flex flex-col gap-5 p-6">
          <div>
            <h3 className="forge-label">Что уже есть</h3>
            <ul className="forge-text-soft mt-4 space-y-3 text-[13px] leading-relaxed">
              <li>
                <Link href="/lore" className="text-[var(--tt-fg)] underline underline-offset-2">
                  Справка
                </Link>{" "}
                — сжатый SRD (монстры, боги), без редактирования.
              </li>
              <li>
                Кампания: граф связей, планы сессий, столкновения, партия; локации, NPC, квесты, таймлайн, лог, галерея.
              </li>
              <li>Сессия — таймер и кубики. Карта — генератор города Watabou, настройки остаются в кампании.</li>
              <li>Экспорт JSON — на странице кампании и в списке кампаний.</li>
            </ul>
          </div>
          <div className="forge-inset text-xs forge-muted leading-relaxed">
            Данные остаются на этом компьютере в браузере. Периодически сохраняйте экспорт JSON с карточки кампании или со списка кампаний — так не потеряете подготовку между переустановками.
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
