export type SettlementSize = "hamlet" | "village" | "town" | "city" | "metropolis";

export type ShopInventoryRoll = {
  summary: string;
  lines: string[];
};

function pickPool<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const MINOR_CONSUMABLES = [
  "простые фоки / химикаты",
  "бинты для стабилизации",
  "бутылочка стандартной еды путников",
];

const MEDIUM_GEAR = [
  "боевой топор качества «служилый»",
  "плащевая сумка дорожника",
  "флакон противоядия простого грейда на один приём",
];

const RARE_SPARKLES = [
  "подержанный огненный палец («престиже» уже никто не удивляет)",
  "плащ с символами чужеземного монастыря (+0 к впечатлению, +2 к любопытству охранников)",
  "сломанное кольцо с гравировкой, которое шептало бы имя если бы умело менять свойства",
];

export function generateShopInventory(size: SettlementSize): ShopInventoryRoll {
  const lines: string[] = [];
  lines.push(`Ориентировочное поселение (${sizeRu(size)}): тяните свои книжные диапазоны цен локально`);

  lines.push(`${pickScale(size)} торговцев на площади + ${Math.max(2, dice6())} палаток смежных узких переулках`);

  if (size !== "hamlet") {
    lines.push(`Обыденные нужды (${pickScale(size)} качество): ${pickPool(MINOR_CONSUMABLES)}`);
  }
  lines.push(`Оружие и доспехи (без официальных имён книг издателя): ${pickWeaponLine(size)}`);
  lines.push(`Потребление и утварь для приключенцев «по экономике мира»: ${consumableLine(size)}`);

  const magicOdds = magicalChancePct(size);
  if (percentRoll() < magicOdds) {
    lines.push(`Странный лот среди утилья: ${pickPool(RARE_SPARKLES)} (платите временем торга и репутацией района)`);
  } else if (magicOdds >= 35) {
    lines.push(`Сегодня без вызывающе магической дряни — возможно её прячут после запросов «погромче покажите склад»`);
  }

  lines.push(`${pickPool(MEDIUM_GEAR)} висит там, где владелец ожидал охотнее лёгкий рынок`);

  const summary =
    size === "hamlet" ? "Придорожное село" : size === "village" ? "Деревня" : size === "town" ? "Город" : "Столица / хаб";

  return { summary, lines };
}

function sizeRu(s: SettlementSize): string {
  const m: Record<SettlementSize, string> = {
    hamlet: "хутор / малое село",
    village: "деревня / ремесло",
    town: "посёлок городского типа",
    city: "городские укрепы",
    metropolis: "мегаполис / перевалочный торг",
  };
  return m[s];
}

function pickScale(size: SettlementSize): string {
  switch (size) {
    case "hamlet":
      return "минимально";
    case "village":
      return "заметное";
    case "town":
      return "густое";
    case "city":
      return "массивное";
    default:
      return "межрегиональное";
  }
}

function dice6() {
  return Math.floor(Math.random() * 6) + 1;
}

function percentRoll(): number {
  return Math.floor(Math.random() * 100);
}

function magicalChancePct(size: SettlementSize): number {
  if (size === "hamlet") return 18;
  if (size === "village") return 28;
  if (size === "town") return 40;
  if (size === "city") return 55;
  return 68;
}

function pickWeaponLine(size: SettlementSize): string {
  if (size === "hamlet") return "до 24 лёгких оружий в ящичке (запас «склад лёжа» ограничен)";
  if (size === "village") return "слой «арсенал охраны»: копья, топоры для лесников, простые короткие мечи";
  if (size === "town") return "лёгкие / средние доспехи с задержкой 1 дня если не нашли нужный чертёж своими мастерами";
  return "богатый выбор, но дорогущие узоры и гравировку лучше разделить между двумя кузницами городского района";
}

function consumableLine(size: SettlementSize): string {
  if (size === "hamlet") return `запасы на ${dice6() + dice6()} дней отъезжающих охотничьих патрулей`;
  return `до ${Math.max(size === "city" ? 8 : size === "metropolis" ? 12 : dice6(), 4)} дней консервов / трав / обвязочных смесей у разных палатников`;
}
