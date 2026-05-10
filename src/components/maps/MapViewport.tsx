"use client";

import Link from "next/link";
import { WatabouCityPanel } from "@/components/maps/WatabouCityPanel";
import { DEFAULT_WATABOU_PARAMS, type WatabouCityParams } from "@/lib/watabouCityUrl";
import { AppShell } from "@/components/AppShell";
import { useForgeStore } from "@/store/useForgeStore";

/** Страница карты кампании: только генератор города Watabou (параметры сохраняются в кампании). */
export function MapViewport({ campaignId }: { campaignId: string }) {
  const campaign = useForgeStore((s) => s.campaigns.find((c) => c.id === campaignId) ?? null);
  const patch = useForgeStore((s) => s.patchBattleMap);

  const mapState = campaign?.map;
  const watabou: WatabouCityParams = mapState?.watabouCity ?? DEFAULT_WATABOU_PARAMS;

  if (!campaign) {
    return (
      <AppShell title="Карта не найдена" kicker="Ошибка" breadcrumb={[{ href: "/campaigns", label: "Все кампании" }]}>
        <Link className="forge-btn-gold inline-flex" href="/campaigns">
          К списку кампаний
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Карта · ${campaign.title}`}
      kicker="Город"
      breadcrumb={[
        { href: "/campaigns", label: "Все кампании" },
        { href: `/campaigns/${campaignId}`, label: "Кампания" },
      ]}
      subtitle="Генератор карты сохранён в данных кампании: seed и переключатели ниже восстанавливаются после перезагрузки."
    >
      <div className="mx-auto max-w-6xl">
        <section className="forge-sheet relative px-4 py-6 md:px-7 md:py-8">
          <div className="relative flex flex-wrap items-start justify-between gap-4 border-b border-dotted border-[var(--tt-line-strong)] pb-5">
            <div className="min-w-0">
              <h2 className="tt-display text-3xl md:text-[2.2rem]">Город партии</h2>
              <p className="forge-muted mt-3 max-w-2xl text-[13px] leading-relaxed">
                Рабочий стол — там, где бой и инициатива («Сессия»). Эта страница только про план поселения через Watabou.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/session/${campaignId}`} className="forge-btn-gold">
                Сессия
              </Link>
              <Link href={`/campaigns/${campaignId}`} className="forge-btn-outline">
                Кампания
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <WatabouCityPanel params={watabou} onChange={(next) => patch(campaignId, { watabouCity: next })} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
