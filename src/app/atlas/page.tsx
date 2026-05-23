"use client";

import { useState } from "react";
import Link from "next/link";
import { FaerunAtlasPanel } from "@/components/maps/FaerunAtlasPanel";
import { ForgePage } from "@/components/ForgePage";
import { DEFAULT_AIDEDD_ATLAS_KEY, type AideddAtlasKey } from "@/lib/aideddAtlas";

const LS_ATLAS_KEY = "master-forge:aidedd-atlas-key";

function readStoredAtlasKey(): AideddAtlasKey {
  if (typeof window === "undefined") return DEFAULT_AIDEDD_ATLAS_KEY;
  const raw = window.localStorage.getItem(LS_ATLAS_KEY);
  if (raw === "faerun" || raw === "sword-coast" || raw === "baldurs-gate" || raw === "laelith") return raw;
  return DEFAULT_AIDEDD_ATLAS_KEY;
}

export default function GlobalAtlasPage() {
  const [atlasKey, setAtlasKey] = useState<AideddAtlasKey>(() => readStoredAtlasKey());

  return (
    <ForgePage title="Атлас Faerûn" kicker="Карта" subtitle="Интерактивный атлас Forgotten Realms (Aidedd).">
      <div className="mx-auto max-w-[min(100%,90rem)] space-y-6 pb-16">
        <p className="forge-muted text-[13px]">
          Выбор карты запоминается в браузере. Для привязки к кампании откройте карту из карточки кампании — там те же атласы плюс генератор города Watabou.
        </p>
        <Link href="/campaigns" className="forge-btn-outline inline-flex text-[11px]">
          К списку кампаний
        </Link>
        <FaerunAtlasPanel
          atlasKey={atlasKey}
          onAtlasKeyChange={(key) => {
            setAtlasKey(key);
            if (typeof window !== "undefined") window.localStorage.setItem(LS_ATLAS_KEY, key);
          }}
        />
      </div>
    </ForgePage>
  );
}
