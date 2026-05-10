import Link from "next/link";
import { SRD_DEITY_PRESETS } from "@/data/srd/presets";
import { SRD_MONSTERS } from "@/data/srd/monsters";
import { AppShell } from "@/components/AppShell";

export default function LoreReferencePage() {
  return (
    <AppShell
      title="Справка SRD 5e"
      kicker="Только для чтения"
      subtitle="Сжатые выдержки из открытого набора правил (OGL / Systems Reference Document). Это не полный текст книг издателя и не замена покупке оригиналов."
    >
      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16">
        <section className="forge-inset border border-dotted border-[var(--tt-line-strong)] p-5 text-[13px] leading-relaxed forge-muted">
          <p>
            Master Forge не хранит редактируемую вики внутри кампании: справочный контент — здесь, единый для всех кампаний. Добавлять и менять строки нельзя; для своего лора
            используйте вкладки «Локации», «Персонажи», «Планы сессий» и т.д.
          </p>
          <p className="mt-3">
            Подробности монстров вне SRD и сеттинговые организации из коммерческих книг сюда не входят по правам на контент.
            См. официальный документ OGL/SRD у правообладателя.
          </p>
          <p className="mt-3">
            <Link href="/campaigns" className="underline underline-offset-2">
              Вернуться к кампаниям
            </Link>
          </p>
        </section>

        <section>
          <h2 className="forge-label mb-6">Монстры (вшитый каталог приложения)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {SRD_MONSTERS.map((m) => (
              <article key={m.key} className="forge-inset p-4 font-mono text-[11px] leading-relaxed">
                <h3 className="text-sm font-semibold normal-case text-[var(--tt-fg)]">
                  {m.nameEn} <span className="forge-muted">CR {m.cr}</span>
                </h3>
                <p className="mt-2 forge-muted">
                  AC {m.ac} · HP ~{m.hpAverage} · {m.speed}
                </p>
                <p className="mt-2 whitespace-pre-wrap">{m.statsNote}</p>
                <p className="mt-2 whitespace-pre-wrap forge-text-soft">{m.extra}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="forge-label mb-6">Пантеон (приложения SRD, коротко)</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {SRD_DEITY_PRESETS.map((d) => (
              <li key={d.key} className="forge-inset p-4 text-sm">
                <strong className="text-[var(--tt-fg)]">{d.nameEn}</strong>
                <span className="ml-2 forge-muted">{d.alignment}</span>
                <p className="mt-2 text-[12px] forge-text-soft">Домены: {d.domainSummary}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
