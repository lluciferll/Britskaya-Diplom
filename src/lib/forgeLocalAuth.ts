import { FORGE_LAST_AUTH_UID_KEY, FORGE_LS_KEY } from "@/lib/forgeStorageConstants";
import { useForgeStore } from "@/store/useForgeStore";

/** Re-export for convenience */
export { FORGE_LAST_AUTH_UID_KEY, FORGE_LS_KEY } from "@/lib/forgeStorageConstants";

export function readLastSyncedAuthUid(): string | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(FORGE_LAST_AUTH_UID_KEY);
  return v && v.trim() !== "" ? v : null;
}

export function writeLastSyncedAuthUid(userId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FORGE_LAST_AUTH_UID_KEY, userId);
}

/**
 * Обнулить кампании в памяти и убрать persist-слайс из localStorage (смена аккаунта в том же браузере).
 */
export function wipeForgeCampaignsPersistAndMemory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(FORGE_LS_KEY);
  useForgeStore.setState({ campaigns: [] });
}
