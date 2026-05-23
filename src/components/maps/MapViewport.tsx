"use client";



import Link from "next/link";

import { useState } from "react";

import { FaerunAtlasPanel } from "@/components/maps/FaerunAtlasPanel";

import { WatabouCityPanel } from "@/components/maps/WatabouCityPanel";

import { DEFAULT_AIDEDD_ATLAS_KEY, type AideddAtlasKey, type MapWorkspaceTab } from "@/lib/aideddAtlas";

import { DEFAULT_WATABOU_PARAMS, type WatabouCityParams } from "@/lib/watabouCityUrl";

import { AppShell } from "@/components/AppShell";
import { ForgeBootLoading, useForgeBootReady } from "@/components/ForgeBootContext";

import { useForgeStore } from "@/store/useForgeStore";



const TAB_LABELS: Record<MapWorkspaceTab, string> = {

  faerun: "Атлас Faerûn (Aidedd)",

  watabou: "Генератор города",

};



/** Страница карты кампании: атлас Faerûn + генератор Watabou (оба сохраняются в кампании). */

export function MapViewport({ campaignId }: { campaignId: string }) {

  const bootReady = useForgeBootReady();
  const campaign = useForgeStore((s) => s.campaigns.find((c) => c.id === campaignId) ?? null);

  const patch = useForgeStore((s) => s.patchBattleMap);



  const mapState = campaign?.map;

  const watabou: WatabouCityParams = mapState?.watabouCity ?? DEFAULT_WATABOU_PARAMS;

  const atlasKey: AideddAtlasKey = mapState?.aideddAtlasKey ?? DEFAULT_AIDEDD_ATLAS_KEY;

  const savedTab = mapState?.mapWorkspaceTab ?? "faerun";



  const [tab, setTab] = useState<MapWorkspaceTab>(savedTab);



  function switchTab(next: MapWorkspaceTab) {

    setTab(next);

    patch(campaignId, { mapWorkspaceTab: next });

  }



  if (!bootReady) {

    return (

      <AppShell title="Загрузка…" kicker="Карта" breadcrumb={[{ href: "/campaigns", label: "Все кампании" }]}>

        <ForgeBootLoading title="Загружаем кампании…" />

      </AppShell>

    );

  }



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

      kicker="Мир и поселения"

      breadcrumb={[

        { href: "/campaigns", label: "Все кампании" },

        { href: `/campaigns/${campaignId}`, label: "Кампания" },

      ]}

      subtitle="Два режима: интерактивный атлас Forgotten Realms (Aidedd) и процедурный город Watabou. Настройки сохраняются в кампании."

    >

      <div className="mx-auto max-w-[min(100%,90rem)]">

        <section className="forge-sheet relative px-4 py-6 md:px-7 md:py-8">

          <div className="relative flex flex-wrap items-start justify-between gap-4 border-b border-dotted border-[var(--tt-line-strong)] pb-5">

            <div className="min-w-0">

              <h2 className="tt-display text-3xl md:text-[2.2rem]">Карты кампании</h2>

              <p className="forge-muted mt-3 max-w-2xl text-[13px] leading-relaxed">

                Бой и инициатива — на экране «Сессия». Здесь — мир Faerûn и план города для подготовки.

              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <Link href={`/session/${campaignId}`} className="forge-btn-gold">

                Сессия

              </Link>

              <Link href={`/campaigns/${campaignId}`} className="forge-btn-outline">

                Кампания

              </Link>

              <Link href="/atlas" className="forge-btn-outline text-[11px] normal-case">

                Атлас без кампании

              </Link>

            </div>

          </div>



          <div className="mt-6 flex flex-wrap gap-2 border-b border-dotted border-[var(--tt-line)] pb-4">

            {(Object.keys(TAB_LABELS) as MapWorkspaceTab[]).map((key) => (

              <button

                key={key}

                type="button"

                onClick={() => switchTab(key)}

                className={tab === key ? "forge-btn-gold text-[11px]" : "forge-btn-outline text-[11px] normal-case"}

              >

                {TAB_LABELS[key]}

              </button>

            ))}

          </div>



          <div className="mt-8">

            {tab === "faerun" ? (

              <FaerunAtlasPanel

                atlasKey={atlasKey}

                onAtlasKeyChange={(key) => patch(campaignId, { aideddAtlasKey: key })}

              />

            ) : (

              <WatabouCityPanel params={watabou} onChange={(next) => patch(campaignId, { watabouCity: next })} />

            )}

          </div>

        </section>

      </div>

    </AppShell>

  );

}

