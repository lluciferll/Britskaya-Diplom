import type { Campaign, CampaignCharacter, Combatant, EncounterBuild, MonsterStatblock } from "@/domain/types";
import { newId } from "@/lib/id";

export function parseHpFromText(raw?: string | number | null): number | null {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return Math.round(raw);
  if (!raw) return null;
  const m = String(raw).match(/\d+/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function combatantFromCharacter(ch: CampaignCharacter): Combatant {
  const fromBlock = parseHpFromText(ch.statBlock?.hp);
  const maxHp = ch.maxHp ?? fromBlock ?? 20;
  const hp = ch.currentHp ?? maxHp;
  return {
    id: newId(),
    name: ch.name,
    initiative: 10,
    initiativeBonus: 0,
    hp,
    maxHp,
    conditions: [ch.tags, ch.statHint].filter(Boolean).join(" · ").slice(0, 120),
  };
}

export function combatantFromMonster(m: MonsterStatblock, copyIndex?: number): Combatant {
  const hp = m.hpAverage && m.hpAverage > 0 ? m.hpAverage : 10;
  const name = copyIndex != null && copyIndex > 1 ? `${m.name} #${copyIndex}` : m.name;
  return {
    id: newId(),
    name,
    initiative: 10,
    initiativeBonus: 0,
    hp,
    maxHp: hp,
    conditions: `CR ${m.cr}`,
  };
}

export function spawnCombatantsFromEncounter(
  campaign: Pick<Campaign, "monsterBlocks">,
  enc: EncounterBuild,
): Combatant[] {
  const spawned: Combatant[] = [];
  for (const row of enc.monsterQuantities ?? []) {
    const m = campaign.monsterBlocks?.find((x) => x.id === row.monsterId);
    if (!m) continue;
    const count = Math.max(1, row.count);
    for (let i = 0; i < count; i += 1) {
      spawned.push(combatantFromMonster(m, count > 1 ? i + 1 : undefined));
    }
  }
  return spawned;
}

export function encounterHasDeployableRows(
  campaign: Pick<Campaign, "monsterBlocks">,
  enc: EncounterBuild,
): boolean {
  return (enc.monsterQuantities ?? []).some((row) => {
    const m = campaign.monsterBlocks?.find((x) => x.id === row.monsterId);
    return Boolean(m) && row.count > 0;
  });
}
