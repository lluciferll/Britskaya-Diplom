import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function ToolsHubPage() {
  return (
    <AppShell
      title="За столом"
      kicker="Калькуляторы и памятки"
      subtitle="Из верхнего меню. Разовые кубики и калькуляторы — без кампании; журнал бросков ведётся только в режиме сессии выбранной кампании."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/tools/dice"
          className="forge-sheet group block p-6 transition hover:bg-[rgba(10,10,10,0.03)]"
        >
          <h2 className="tt-display text-xl text-[var(--tt-fg)]">Кубики</h2>
          <p className="forge-muted mt-3 text-sm leading-relaxed">
            Формулы вроде «2d6+3», преимущество и помеха для d20. В сессии кампании броски пишутся в журнал.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--tt-muted)] group-hover:text-[var(--tt-fg)]">Открыть →</p>
        </Link>
        <Link
          href="/tools/encounter"
          className="forge-sheet group block p-6 transition hover:bg-[rgba(10,10,10,0.03)]"
        >
          <h2 className="tt-display text-xl text-[var(--tt-fg)]">Встреча по XP</h2>
          <p className="forge-muted mt-3 text-sm leading-relaxed">
            Сумма XP за CR, множитель за число монстров и оценка сложности для группы (5e DMG).
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--tt-muted)] group-hover:text-[var(--tt-fg)]">Открыть →</p>
        </Link>
        <Link
          href="/tools/loot"
          className="forge-sheet group block p-6 transition hover:bg-[rgba(10,10,10,0.03)]"
        >
          <h2 className="tt-display text-xl text-[var(--tt-fg)]">Добыча</h2>
          <p className="forge-muted mt-3 text-sm leading-relaxed">
            Монеты и сюжетные элементы находок — быстрый импульс для награды.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--tt-muted)] group-hover:text-[var(--tt-fg)]">Открыть →</p>
        </Link>
        <Link
          href="/reference"
          className="forge-sheet group block p-6 transition hover:bg-[rgba(10,10,10,0.03)] md:col-span-2"
        >
          <h2 className="tt-display text-xl text-[var(--tt-fg)]">Шпаргалка мастера</h2>
          <p className="forge-muted mt-3 text-sm leading-relaxed">
            Состояния, проверки, ссылки на инструменты — только то, что нужно за столом.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--tt-muted)] group-hover:text-[var(--tt-fg)]">Открыть →</p>
        </Link>
      </div>
    </AppShell>
  );
}
