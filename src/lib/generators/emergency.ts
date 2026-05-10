import { generateNpc, type GeneratedNpc } from "@/lib/generators/npc";
import { generateEvent, type RandomEventPack } from "@/lib/generators/events";

export type EmergencyPack = {
  seed: number;
  npc: GeneratedNpc;
  event: RandomEventPack;
  questHook: string;
};

function questHookFrom(npc: GeneratedNpc, event: RandomEventPack): string {
  return [
    `Крючок: столкновение с «${npc.epithet}» — ${npc.firstName}, ${npc.role}.`,
    `Событие: ${event.situation}`,
    `Поворот и цена сцены: ${event.twist}`,
    `Секрет может всплыть здесь же: ${npc.secret}`,
  ].join(" ");
}

export function generateEmergency(opts?: { seed?: number; partyLevel?: number; systemHint?: string }): EmergencyPack {
  const baseRaw = typeof opts?.seed === "number" ? (opts.seed >>> 0) : (Date.now() ^ (Math.floor(Math.random() * 1e9) >>> 0));
  const base = baseRaw >>> 0;

  const npcSeed = base ^ 0x9e3779b9;
  const eventSeed = (base << 13) ^ 0xb5297a4d;

  const npc = generateNpc({ seed: npcSeed >>> 0, partyLevel: opts?.partyLevel, systemHint: opts?.systemHint });
  const event = generateEvent({ seed: eventSeed >>> 0 });

  return {
    seed: base >>> 0,
    npc,
    event,
    questHook: questHookFrom(npc, event),
  };
}
