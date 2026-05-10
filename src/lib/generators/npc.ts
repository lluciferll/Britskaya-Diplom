import { mulberry32, pick } from "@/lib/rng";

export type NpcAlignment = "Закон-добро" | "Нейтралитет" | "Хаос" | "Зло" | "Серый";

export type GeneratedNpc = {
  seed: number;
  firstName: string;
  lastName: string;
  epithet: string;
  ancestry: string;
  role: string;
  appearance: string;
  persona: string;
  alignment: string;
  secret: string;
  motivation: string;
  voiceHint: string;
  quirk: string;
  shortHistory: string;
  statBlockNotes: string;
};

const NAMES_FIRST = ["Айра", "Борун", "Селена", "Дорн", "Эйва", "Феникс", "Грант", "Хелена", "Ивар", "Кира", "Лиам", "Мира", "Найра", "Орик", "Пайк", "Ривен", "Сорель", "Талия", "Ульф", "Вейс"];
const NAMES_LAST = ["Блэквуд", "Камнерез", "Серебродол", "Пепельный", "Ветрозвук", "НочнойСтранник", "Камнетёс", "Бурелом", "Солнцевск", "МорскаяСоль"];
const EPITHETS = ["Тихая сталь", "Пепельный смех", "Двугранник", "Сонный кот", "Красное перо", "Безымянная печать", "Третий палец"];

const ANCESTRIES = [
  "человек",
  "полуэльф",
  "дварф",
  "полуорк",
  "тифлинг",
  "полурослик",
  "генasi",
  "гном",
];

const ROLES = [
  "купец-альтруист",
  "стражниковый сержант",
  "алхимик-герметист",
  "бард-наблюдатель",
  "жрец уличного алтаря",
  "монах-исследователь",
  "плут-собиратель слухов",
  "рейнджер-контрабандист",
  "боевой маг-артиллерист",
  "воин-ветеран",
  "волшебник-архивариус",
  "варлок с «долгом за подписью»",
];

const APPEARANCE_PARTS_A = ["высокий", "компактный", "стройный", "массивный", "пружинистый"];
const APPEARANCE_PARTS_B = ["с шрамом у виска", "с тату в виде рун", "с серыми глазами", "с золотой монетой на шее", "с перстнем гильдии", "с кожаной повязкой на руке"];
const APPEARANCE_PARTS_C = ["одет в потёртую дорожную накидку", "в плаще, пахнущем дымом и лакрицей", "в чистом, но устаревшем мундире", "в одежде цвета мокрого камня"];

const PERSONAS = [
  "осторожный стратег, любит задавать вопросы вместо ответов",
  "харизматичный болтун, скрывает усталость за шутками",
  "холодный профессионал, ценит контракты и тишину",
  "мечтатель-идеалист, которого легко втянуть в авантюру",
  "параноик с мягким голосом и твёрдыми границами",
  "скептик, но не откажет, если дело про справедливость",
];

const ALIGNMENTS: NpcAlignment[] = ["Закон-добро", "Нейтралитет", "Хаос", "Зло", "Серый"];

const SECRETS = [
  "должен кому-то из фракции крупную сумму",
  "шпионит за старой любовью, которая теперь враг",
  "хранит ключ от подвала, где спрятан артефакт",
  "подставил невинного и теперь ищет искупления",
  "ведёт двойную игру между двумя гильдиями",
  "знает настоящее имя демона, но молчит из страха",
];

const MOTIVATIONS = [
  "спасти семью",
  "заработать на новый корабль/мастерскую",
  "раскрыть заговор, не попав под удар",
  "вернуть утраченную честь",
  "найти учителя, который исчез",
  "отомстить за сожжённую деревню",
];

const VOICE_HINTS = [
  "низкий, с лёгкой хрипотцой",
  "быстрый, с лёгким акцентом с севера",
  "ровный, «канцелярский», но с тёплыми провалами",
  "тихий, будто всегда за спиной",
  "громкий «театральный», но глаза холодные",
];

const QUIRKS = [
  "постукивает пальцами по столу в такт несуществующей мелодии",
  "всегда нюхает чай перед тем как пить",
  "не смотрит в глаза первые пять секунд разговора",
  "кладёт монету на стол как «печать времени»",
  "рассказывает притчи старины, когда нервничает",
];

function statNotesFor(system: string, level: number): string {
  const safe = Math.max(1, Math.min(20, Math.round(level)));
  const mod = Math.floor((safe - 10) / 2);
  if (/pathfinder|pf2|pf 2/i.test(system)) {
    return `PF2e-ориентир: Уровень ${safe}; навыки и DC подбирайте от сцены (+${Math.max(mod, 0)} к ключевой характеристике как ориентир).`;
  }
  return `D&D 5e-ориентир: «герой района» около ур. ${Math.min(safe + 2, 20)} или «босс сцены» если нужно давление (AC/HP по DMG для CR ≈ party).`;
}

export function generateNpc(opts: {
  seed?: number;
  systemHint?: string;
  partyLevel?: number;
}): GeneratedNpc {
  const seed = typeof opts.seed === "number" ? (opts.seed >>> 0) : (Date.now() ^ (Math.floor(Math.random() * 1e9) >>> 0));
  const rng = mulberry32(seed);

  const firstName = pick(rng, NAMES_FIRST);
  const lastName = pick(rng, NAMES_LAST);
  const epithet = pick(rng, EPITHETS);
  const ancestry = pick(rng, ANCESTRIES);
  const role = pick(rng, ROLES);

  const appearance = `${pick(rng, APPEARANCE_PARTS_A)}, ${pick(rng, APPEARANCE_PARTS_B)}, ${pick(rng, APPEARANCE_PARTS_C)}`;
  const persona = pick(rng, PERSONAS);
  const alignment = pick(rng, ALIGNMENTS);
  const secret = pick(rng, SECRETS);
  const motivation = pick(rng, MOTIVATIONS);
  const voiceHint = pick(rng, VOICE_HINTS);
  const quirk = pick(rng, QUIRKS);

  const shortHistory = `${firstName} ${lastName}, ${ancestry}, когда-то ${role}: ${motivation.toLowerCase()}. Сейчас ${persona}.`;

  return {
    seed,
    firstName,
    lastName,
    epithet,
    ancestry,
    role,
    appearance,
    persona,
    alignment,
    secret,
    motivation,
    voiceHint,
    quirk,
    shortHistory,
    statBlockNotes: statNotesFor(opts.systemHint || "dnd5e", opts.partyLevel ?? 3),
  };
}
