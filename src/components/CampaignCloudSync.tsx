"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ForgeBootProvider } from "@/components/ForgeBootContext";
import { mergeCampaignLists } from "@/lib/campaignsMerge";
import {
  clearAllCampaignDeletedTombstones,
  clearCampaignDeleted,
  clearForgeLocalCampaignData,
  readDeletedCampaignIds,
  readLastSyncedAuthUid,
  wipeForgeCampaignsPersistAndMemory,
  writeLastSyncedAuthUid,
} from "@/lib/forgeLocalAuth";
import { isPreviewModeClient, PREVIEW_SESSION_SEEDED } from "@/lib/previewMode";
import { getPreviewSeedCampaigns } from "@/lib/previewSeed";
import { deleteCampaignRow, fetchCampaignPayloads, upsertCampaignRow } from "@/lib/supabase/campaignRows";
import { createClient } from "@/lib/supabase/client";
import { waitForForgeStoreHydrated } from "@/lib/waitForForgeStoreHydrated";
import { useForgeStore } from "@/store/useForgeStore";

const DEBOUNCE_MS = 900;
const HYDRATE_TIMEOUT_MS = 20_000;

function persistHasHydratedSafe(): boolean {
  const p = useForgeStore.persist;
  return p?.hasHydrated?.() ?? false;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`${label}: timeout ${ms}ms`)), ms);
    promise
      .then((v) => {
        window.clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        window.clearTimeout(timer);
        reject(e);
      });
  });
}

export function CampaignCloudSync({ children }: { children: ReactNode }) {
  const [persistReady, setPersistReady] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const suppressSync = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const hydrationRound = useRef(0);
  const prevCampaignIdsRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (persistHasHydratedSafe()) {
      setPersistReady(true);
      return;
    }
    const p = useForgeStore.persist;
    if (!p?.onFinishHydration) {
      setPersistReady(true);
      return;
    }
    const unsub = p.onFinishHydration(() => setPersistReady(true));
    const fallback = window.setTimeout(() => setPersistReady(true), 2500);
    return () => {
      unsub();
      window.clearTimeout(fallback);
    };
  }, []);

  async function flushUpserts(userId: string): Promise<void> {
    const list = useForgeStore.getState().campaigns;
    for (const c of list) {
      await upsertCampaignRow(userId, c);
    }
  }

  useEffect(() => {
    if (isPreviewModeClient()) {
      let cancelled = false;
      void (async () => {
        await waitForForgeStoreHydrated();
        if (cancelled) return;
        if (!sessionStorage.getItem(PREVIEW_SESSION_SEEDED)) {
          wipeForgeCampaignsPersistAndMemory();
          clearAllCampaignDeletedTombstones();
          useForgeStore.setState({ campaigns: getPreviewSeedCampaigns() });
          sessionStorage.setItem(PREVIEW_SESSION_SEEDED, "1");
        } else if (useForgeStore.getState().campaigns.length === 0) {
          useForgeStore.setState({ campaigns: getPreviewSeedCampaigns() });
        }
        setCloudReady(true);
      })();
      return () => {
        cancelled = true;
      };
    }

    const sb = createClient();
    let cancelled = false;

    async function hydrateFromCloud(userId: string) {
      hydrationRound.current += 1;
      const ticket = hydrationRound.current;
      suppressSync.current = true;
      try {
        await waitForForgeStoreHydrated();

        const prevSynced = readLastSyncedAuthUid();
        if (prevSynced !== null && prevSynced !== userId) {
          wipeForgeCampaignsPersistAndMemory();
          clearAllCampaignDeletedTombstones();
        }

        const local = useForgeStore.getState().campaigns;
        const tombstones = readDeletedCampaignIds();
        const { campaigns: remote, error: fetchError } = await withTimeout(
          fetchCampaignPayloads(),
          HYDRATE_TIMEOUT_MS,
          "fetchCampaignPayloads",
        );
        if (cancelled || ticket !== hydrationRound.current) return;

        if (fetchError) {
          console.warn("[campaigns cloud] hydrate: fetch failed, keeping local", fetchError);
          prevCampaignIdsRef.current = new Set(local.map((c) => c.id));
          await withTimeout(flushUpserts(userId), HYDRATE_TIMEOUT_MS, "flushUpserts");
          writeLastSyncedAuthUid(userId);
          return;
        }

        const remoteFiltered = remote.filter((c) => !tombstones.has(c.id));
        const merged = mergeCampaignLists(remoteFiltered, local);
        useForgeStore.setState({ campaigns: merged });
        prevCampaignIdsRef.current = new Set(merged.map((c) => c.id));
        await withTimeout(flushUpserts(userId), HYDRATE_TIMEOUT_MS, "flushUpserts");
        writeLastSyncedAuthUid(userId);
      } catch (e) {
        console.warn("[campaigns cloud] hydrate", e);
      } finally {
        suppressSync.current = false;
        if (!cancelled && ticket === hydrationRound.current) setCloudReady(true);
      }
    }

    void sb.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      const user = session?.user ?? null;
      userIdRef.current = user?.id ?? null;
      prevCampaignIdsRef.current = new Set(useForgeStore.getState().campaigns.map((c) => c.id));
      if (user) void hydrateFromCloud(user.id);
      else setCloudReady(true);
    });

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      userIdRef.current = session?.user?.id ?? null;
      if (session?.user) {
        void hydrateFromCloud(session.user.id);
      } else {
        if (event === "SIGNED_OUT") clearForgeLocalCampaignData();
        prevCampaignIdsRef.current = new Set(useForgeStore.getState().campaigns.map((c) => c.id));
        setCloudReady(true);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    prevCampaignIdsRef.current = new Set(useForgeStore.getState().campaigns.map((c) => c.id));

    const unsub = useForgeStore.subscribe((state) => {
      if (suppressSync.current) return;
      if (isPreviewModeClient()) return;
      const userId = userIdRef.current;
      if (!userId) return;

      const camps = state.campaigns;
      const nextIds = new Set(camps.map((c) => c.id));
      const prevIds = prevCampaignIdsRef.current;

      void (async () => {
        for (const id of prevIds) {
          if (!nextIds.has(id)) {
            const ok = await deleteCampaignRow(id);
            if (ok) clearCampaignDeleted(id);
          }
        }
      })();

      prevCampaignIdsRef.current = nextIds;

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        void flushUpserts(userId);
      }, DEBOUNCE_MS);
    });

    return () => unsub();
  }, []);

  return (
    <ForgeBootProvider persistReady={persistReady} cloudReady={cloudReady}>
      {children}
    </ForgeBootProvider>
  );
}
