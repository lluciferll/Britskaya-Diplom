import { evaluateDiceExpression } from "@/lib/dice";

export type LootTier = "minor" | "standard" | "major" | "hoard";

export type LootRoll = {
  tier: LootTier;
  summary: string;
  detailLines: string[];
};

const FLAVOR_MINOR = [
  "потёртая дорожная брошюра со схемой подземеля",
  "бирка гильдии, которую лучше не показывать стражникам",
  "потайной карман в старой накидке",
  "карта побега через канализацию (частично выцвела)",
];

const FLAVOR_STANDARD = [
  "перо с письмом — отправитель уже мёртв",
  "бронеткань с гербом узурпатора эпохи веков давности",
  "бутылочка масла звёздного света без этикетки",
  "камень ключ с защёлкой, которая тихо гудит",
];

const FLAVOR_MAJOR = [
  "серебряное кольцо с клеймом гильдии воров",
  "сломанное жезло: внутри слышится слабый перезвон",
  "свиток в трубообразном футляре, защита от огня уже сработала когда-то",
  "монета с двумя головами, не поддаётся простому Обнаружению магии",
];

/** Быстрая генерация находок без воспроизведения конкретных таблиц WotC — монеты через кубики, идея — для жанрового темпа. */

function rollCoins(formula: string, labelRu: string): string {
  const r = evaluateDiceExpression(formula);
  return `${r.formula.replace(/\+\s*$/g, "")} → монетное выраж (${labelRu}): ${r.total} (детально: ${r.detail})`;
}

export function rollLootTier(tier: LootTier): LootRoll {
  const detailLines: string[] = [];

  if (tier === "minor") {
    detailLines.push(rollCoins("5d12", "серебреники / эквивалент см"));
    detailLines.push(`Мелкий артефакт быта или подсказка: ${pick(FLAVOR_MINOR)}`);
    return { tier, summary: "Мелкая добыча", detailLines };
  }

  if (tier === "standard") {
    detailLines.push(rollCoins("12d12", "серебро + украшения-бонус сверх вашей экономики кампании"));
    detailLines.push(rollCoins("2d12", "золото / редкая расплата наличными"));
    detailLines.push(`Сюжетный крош или припасы: ${pick(FLAVOR_STANDARD)}`);
    return { tier, summary: "Боестолкновение / задача средней значимости", detailLines };
  }

  if (tier === "major") {
    detailLines.push(rollCoins("6d12+20", "значимая сумма золота (проверка конвертации вашей экономикой мира)"));
    detailLines.push(rollCoins("2d12+4", "доп. «особый металл» через редкий бартер"));
    detailLines.push(`Необычный предмет/улика для арки: ${pick(FLAVOR_MAJOR)}`);
    return { tier, summary: "Серьёзная награда / мини-босс", detailLines };
  }

  detailLines.push(rollCoins("10d12+40", "крупное золото"));
  detailLines.push(rollCoins("4d6+12", "доп. «монетизация»: редкая мелкая магическая потребность / опыт ремесленников"));
  detailLines.push("Сокровищница: положите вручную 1 предмет необходимости для продвижения сюжета + риск охранников.");
  detailLines.push("Для «настоящего склада»: сверьтесь со своими таблицами магической добычи; здесь только импульс.");
  return { tier, summary: "Сокровище / финал арки", detailLines };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
