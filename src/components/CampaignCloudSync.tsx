"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { mergeCampaignLists } from "@/lib/campaignsMerge";
import {
  readLastSyncedAuthUid,
  wipeForgeCampaignsPersistAndMemory,
  writeLastSyncedAuthUid,
} from "@/lib/forgeLocalAuth";
import { deleteCampaignRow, fetchCampaignPayloads, upsertCampaignRow } from "@/lib/supabase/campaignRows";
import { createClient } from "@/lib/supabase/client";
import { useForgeStore } from "@/store/useForgeStore";

const DEBOUNCE_MS = 900;

export function CampaignCloudSync({ children }: { children: ReactNode }) {
  const suppressSync = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const hydrationRound = useRef(0);
  const prevCampaignIdsRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function flushUpserts(userId: string): Promise<void> {
    const list = useForgeStore.getState().campaigns;
    for (const c of list) {
      await upsertCampaignRow(userId, c);
    }
  }

  useEffect(() => {
    const sb = createClient();

    async function hydrateFromCloud(userId: string) {
      hydrationRound.current += 1;
      const ticket = hydrationRound.current;
      suppressSync.current = true;
      try {
        const prevSynced = readLastSyncedAuthUid();
        if (prevSynced !== null && prevSynced !== userId) {
          wipeForgeCampaignsPersistAndMemory();
        }
        const remote = await fetchCampaignPayloads();
        if (ticket !== hydrationRound.current) return;
        const local = useForgeStore.getState().campaigns;
        const merged = mergeCampaignLists(remote, local);
        useForgeStore.setState({ campaigns: merged });
        prevCampaignIdsRef.current = new Set(merged.map((c) => c.id));
        await flushUpserts(userId);
        writeLastSyncedAuthUid(userId);
      } catch (e) {
        console.warn("[campaigns cloud] hydrate", e);
      } finally {
        suppressSync.current = false;
      }
    }

    void sb.auth.getUser().then(({ data: { user } }) => {
      userIdRef.current = user?.id ?? null;
      if (user) void hydrateFromCloud(user.id);
      else prevCampaignIdsRef.current = new Set(useForgeStore.getState().campaigns.map((c) => c.id));
    });

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      userIdRef.current = session?.user?.id ?? null;
      if (session?.user) void hydrateFromCloud(session.user.id);
      else prevCampaignIdsRef.current = new Set(useForgeStore.getState().campaigns.map((c) => c.id));
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    prevCampaignIdsRef.current = new Set(useForgeStore.getState().campaigns.map((c) => c.id));

    const unsub = useForgeStore.subscribe((state) => {
      if (suppressSync.current) return;
      const userId = userIdRef.current;
      if (!userId) return;

      const camps = state.campaigns;
      const nextIds = new Set(camps.map((c) => c.id));
      const prevIds = prevCampaignIdsRef.current;

      void (async () => {
        for (const id of prevIds) {
          if (!nextIds.has(id)) await deleteCampaignRow(id);
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

  return <>{children}</>;
}
