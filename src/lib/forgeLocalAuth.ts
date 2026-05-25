import {

  FORGE_DELETED_CAMPAIGN_IDS_KEY,

  FORGE_LAST_AUTH_UID_KEY,

  FORGE_LS_KEY,

} from "@/lib/forgeStorageConstants";

import { useForgeStore } from "@/store/useForgeStore";



/** Re-export for convenience */

export { FORGE_LAST_AUTH_UID_KEY, FORGE_LS_KEY } from "@/lib/forgeStorageConstants";



function readDeletedCampaignIdsRaw(): string[] {

  if (typeof window === "undefined") return [];

  try {

    const raw = window.localStorage.getItem(FORGE_DELETED_CAMPAIGN_IDS_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;

    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string" && id.length > 0) : [];

  } catch {

    return [];

  }

}



function writeDeletedCampaignIds(ids: string[]) {

  if (typeof window === "undefined") return;

  if (ids.length === 0) window.localStorage.removeItem(FORGE_DELETED_CAMPAIGN_IDS_KEY);

  else window.localStorage.setItem(FORGE_DELETED_CAMPAIGN_IDS_KEY, JSON.stringify(ids));

}



export function readDeletedCampaignIds(): Set<string> {

  return new Set(readDeletedCampaignIdsRaw());

}



/** Пометить кампанию удалённой, чтобы merge с облаком не вернул её после F5. */

export function recordCampaignDeleted(campaignId: string) {

  if (typeof window === "undefined") return;

  const ids = readDeletedCampaignIdsRaw();

  if (!ids.includes(campaignId)) ids.push(campaignId);

  writeDeletedCampaignIds(ids);

}



export function clearCampaignDeleted(campaignId: string) {

  if (typeof window === "undefined") return;

  writeDeletedCampaignIds(readDeletedCampaignIdsRaw().filter((id) => id !== campaignId));

}



export function clearAllCampaignDeletedTombstones() {

  if (typeof window === "undefined") return;

  window.localStorage.removeItem(FORGE_DELETED_CAMPAIGN_IDS_KEY);

}



export function readLastSyncedAuthUid(): string | null {

  if (typeof window === "undefined") return null;

  const v = window.localStorage.getItem(FORGE_LAST_AUTH_UID_KEY);

  return v && v.trim() !== "" ? v : null;

}



export function writeLastSyncedAuthUid(userId: string) {

  if (typeof window === "undefined") return;

  window.localStorage.setItem(FORGE_LAST_AUTH_UID_KEY, userId);

}



export function clearLastSyncedAuthUid() {

  if (typeof window === "undefined") return;

  window.localStorage.removeItem(FORGE_LAST_AUTH_UID_KEY);

}



/**

 * Обнулить кампании в памяти и убрать persist-слайс из localStorage (смена аккаунта в том же браузере).

 */

export function wipeForgeCampaignsPersistAndMemory() {

  if (typeof window === "undefined") return;

  window.localStorage.removeItem(FORGE_LS_KEY);

  useForgeStore.setState({ campaigns: [] });

}



/** Выход или смена пользователя — очистить локальные кампании и метки удаления. */

export function clearForgeLocalCampaignData() {

  wipeForgeCampaignsPersistAndMemory();

  clearAllCampaignDeletedTombstones();

  clearLastSyncedAuthUid();

}


