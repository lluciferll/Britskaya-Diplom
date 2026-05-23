import type { ReferenceCategory } from "./types";

export const REFERENCE_CATEGORIES: ReferenceCategory[] = [
  { id: "spells", labelRu: "Заклинания", hint: "SRD 5e, описания на русском", icon: "◆" },
  { id: "feats", labelRu: "Черты", hint: "Feats из открытых правил", icon: "★" },
  { id: "invocations", labelRu: "Воззвания", hint: "Warlock invocations (SRD)", icon: "◇" },
  { id: "magic-items", labelRu: "Магические предметы", hint: "Классические предметы SRD", icon: "⬡" },
  { id: "monsters", labelRu: "Монстры", hint: "Краткие статблоки SRD", icon: "☠" },
  { id: "deities", labelRu: "Пантеон", hint: "Божества из приложений SRD", icon: "☼" },
];
