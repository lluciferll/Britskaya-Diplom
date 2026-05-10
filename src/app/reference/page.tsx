import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function ReferencePage() {
  return (
    <AppShell
      title="Шпаргалка мастера"
      kicker="D&D 5e · кратко"
      breadcrumb={[{ href: "/tools", label: "За столом" }]}
      subtitle="Подсказки для скорости за столом, не официальный текст книги. Спорное — заглянули в свой PDF или PHB."
    >
      <div className="space-y-8 text-sm leading-relaxed">
        <section className="forge-sheet p-6">
          <h2 className="text-base font-semibold tracking-tight">Состояния (что помнить за столом)</h2>
          <ul className="forge-muted mt-4 list-disc space-y-2 pl-5 marker:text-[var(--tt-muted)]">
            <li>
              <span className="font-semibold text-[var(--tt-fg)]">Ослеплён:</span> провалы проверок, требующих зрения; атаки по существу с преимуществом; его атаки с помехой.
            </li>
            <li>
              <span className="font-semibold text-[var(--tt-fg)]">Очарован:</span> не может атаковать чарующего; чарующий имеет преимущество на социальные проверки против цели.
            </li>
            <li>
              <span className="font-semibold text-[var(--tt-fg)]">Глухой:</span> провалы проверок, требующих слуха; иммунитет ко многим заклинаниям «слышишь меня».
            </li>
            <li>
              <span className="font-semibold text-[var(--tt-fg)]">Испуган:</span> помеха на спасброски и проверки характеристик, пока видит источник страха; не может добровольно приблизиться.
            </li>
            <li>
              <span className="font-semibold text-[var(--tt-fg)]">Опутан:</span> скорость 0; атаки с помехой, по существу — с преимуществом, если только дистанция важна.
            </li>
            <li>
              <span className="font-semibold text-[var(--tt-fg)]">Недееспособен:</span> не может действовать или реагировать; падает, отпускает удерживаемое; автопровалы силы и ловкости.
            </li>
            <li>
              <span className="font-semibold text-[var(--tt-fg)]">Невидимый:</span> нельзя видеть без особых чувств; атаки по существу с помехой, его атаки с преимуществом (пока скрытие не нарушено).
            </li>
            <li>
              <span className="font-semibold text-[var(--tt-fg)]">Опьянён / Окаменевший / Ошеломлён / Парализованный / Отравленный:</span> держите карточку под рукой — эффекты разные; в сессии список состояний у бойцов.
            </li>
          </ul>
          <p className="forge-muted mt-4 text-xs leading-relaxed">
            Краткие подсказки для скорости, не дословная цитата правил. Уточняйте по своей книге или SRD.
          </p>
        </section>

        <section className="forge-sheet p-6">
          <h2 className="text-base font-semibold tracking-tight">Сложность проверки (ориентир)</h2>
          <ul className="forge-muted mt-4 list-disc space-y-2 pl-5 marker:text-[var(--tt-muted)]">
            <li>Очень лёгкая — DC 5; лёгкая — 10; средняя — 15; тяжёлая — 20; очень тяжёлая — 25; почти невозможная — 30+.</li>
            <li>Пассивная внимательность сравнивается с DC скрытых угроз.</li>
          </ul>
        </section>

        <section className="forge-sheet p-6">
          <h2 className="text-base font-semibold tracking-tight">0 HP и стабилизация</h2>
          <ul className="forge-muted mt-4 list-disc space-y-2 pl-5 marker:text-[var(--tt-muted)]">
            <li>При 0 HP: падение ничейного, потеря сознания; дальше спасброски смерти d20 со следующего хода.</li>
            <li>Урон от крита в упор при 0 HP — два провала сразу; массивный урон — правило «мгновенная смерть» в книге.</li>
            <li>Стабилизация: Медицина DC 10, лечение, или естественная 10+ на d20 в начале хода.</li>
          </ul>
        </section>

        <section className="forge-sheet p-6">
          <h2 className="text-base font-semibold tracking-tight">Что открыть в Master Forge</h2>
          <ul className="forge-muted mt-4 list-disc space-y-2 pl-5 marker:text-[var(--tt-muted)]">
            <li>
              <Link className="font-medium text-[var(--tt-fg)] underline underline-offset-4 hover:opacity-70" href="/tools/dice">
                Кубики
              </Link>{" "}
              — формулы и преимущество на d20.
            </li>
            <li>
              <Link className="font-medium text-[var(--tt-fg)] underline underline-offset-4 hover:opacity-70" href="/tools/encounter">
                Встреча по XP
              </Link>{" "}
              — быстрая оценка «не перебор ли».
            </li>
            <li>
              <Link className="font-medium text-[var(--tt-fg)] underline underline-offset-4 hover:opacity-70" href="/tools/loot">
                Добыча
              </Link>{" "}
              — монеты и текстовые находки.
            </li>
            <li>
              <Link className="font-medium text-[var(--tt-fg)] underline underline-offset-4 hover:opacity-70" href="/generators/emergency">
                Emergency
              </Link>{" "}
              — если партия ушла в сторону от подготовки.
            </li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
