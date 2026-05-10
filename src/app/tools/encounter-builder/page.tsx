import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function EncounterBuilderInfoPage() {
  return (
    <AppShell
      title="Конструктор столкновений"
      kicker="Интеграция в кампании"
      breadcrumb={[{ href: "/tools", label: "За столом" }]}
      subtitle="Полная «лаборатория» с монстрами, сохранёнными пачками и расчётом сложности уже внутри карточки кампании — вкладка «Столкновения». Эта страница — навигационный мост для тех, кто ищет название в меню."
    >
      <div className="forge-sheet max-w-2xl space-y-5 p-6 text-sm leading-relaxed">
        <ol className="list-decimal space-y-3 pl-5 forge-text-soft">
          <li>Создайте или откройте кампанию.</li>
          <li>В ряду вкладок мастерской выберите «Столкновения».</li>
          <li>Добавьте статблоки монстров вручную (ваш SRD-список или хоумбрю).</li>
          <li>Соберите «сохранённые столкновения» и получите оценку «легко / середина / смертельно».</li>
          <li>Откройте калькулятор «Встреча по XP», если нужно сравнить с ручным калькулятором.</li>
        </ol>
        <div className="flex flex-wrap gap-2">
          <Link href="/campaigns" className="forge-btn-gold px-5">
            Перейти к кампаниям
          </Link>
          <Link href="/tools/encounter" className="forge-btn-outline px-5">
            Калькулятор CR
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
