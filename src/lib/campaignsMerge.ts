import type { Campaign } from "@/domain/types";
import { ensureImportedCampaign } from "@/lib/campaignBackup";

/** При равных датах правим локальную копию (активная сессия в браузере). */
function pickNewerPreferLocal(local: Campaign, remote: Campaign): Campaign {
  const tl = Date.parse(local.updatedAt);
  const tr = Date.parse(remote.updatedAt);
  if (Number.isFinite(tr) && Number.isFinite(tl)) {
    if (tr > tl) return ensureImportedCampaign(remote);
    return ensureImportedCampaign(local);
  }
  return ensureImportedCampaign(local);
}

/** Объединение облака и локального стора по id; сортировка как в UI — свежие выше. */
export function mergeCampaignLists(remoteRaw: Campaign[], localRaw: Campaign[]): Campaign[] {
  const remote = remoteRaw.map((c) => ensureImportedCampaign(c));
  const local = localRaw.map((c) => ensureImportedCampaign(c));
  const rmap = new Map(remote.map((c) => [c.id, c]));
  const lmap = new Map(local.map((c) => [c.id, c]));
  const ids = new Set<string>([...rmap.keys(), ...lmap.keys()]);
  const merged: Campaign[] = [];

  for (const id of ids) {
    const r = rmap.get(id);
    const l = lmap.get(id);
    if (r && l) merged.push(pickNewerPreferLocal(l, r));
    else if (r) merged.push(r);
    else if (l) merged.push(l);
  }

  merged.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  return merged;
}
