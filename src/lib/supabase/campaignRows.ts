import type { Campaign } from "@/domain/types";
import { ensureImportedCampaign } from "@/lib/campaignBackup";
import { createClient } from "@/lib/supabase/client";

export async function fetchCampaignPayloads(): Promise<Campaign[]> {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];

  const { data, error } = await sb.from("campaigns").select("payload").order("updated_at", { ascending: false });
  if (error) {
    console.warn("[campaigns cloud] fetch:", error.message);
    return [];
  }

  const rows = (data ?? []) as { payload: unknown }[];
  return rows.map((r) => ensureImportedCampaign(r.payload as Campaign));
}

export async function upsertCampaignRow(userId: string, campaign: Campaign): Promise<void> {
  const sb = createClient();
  const payload = ensureImportedCampaign(campaign);
  const { error } = await sb.from("campaigns").upsert(
    {
      id: payload.id,
      user_id: userId,
      payload,
      updated_at: payload.updatedAt,
    },
    { onConflict: "id" },
  );
  if (error) console.warn("[campaigns cloud] upsert", payload.id, error.message);
}

export async function deleteCampaignRow(campaignId: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("campaigns").delete().eq("id", campaignId);
  if (error) console.warn("[campaigns cloud] delete", campaignId, error.message);
}
