/** Тот же ключ, что у zustand/persist для кампаний (useForgeStore). */
export const FORGE_LS_KEY = "master-forge:v5";

/** В какую учётную запись привязано локальное persist-хранилище кампаний. */
export const FORGE_LAST_AUTH_UID_KEY = "master-forge:last-synced-auth-uid";

/** Id кампаний, удалённых локально, пока не подтверждено удаление в Supabase. */
export const FORGE_DELETED_CAMPAIGN_IDS_KEY = "master-forge:deleted-campaign-ids";
