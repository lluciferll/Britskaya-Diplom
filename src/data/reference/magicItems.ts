import type { ReferenceEntry } from "./types";

export const REFERENCE_MAGIC_ITEMS: ReferenceEntry[] = [
  {
    key: "potion-of-healing",
    category: "magic-items",
    nameRu: "Зелье лечения",
    nameEn: "Potion of Healing",
    subtitle: "Обычный",
    summary: "2d4+2 HP",
    body: `**Редкость:** обычный · **Тип:** зелье

Действием выпиваете и восстанавливаете **2d4+2** HP.`,
    tags: ["зелье"],
  },
  {
    key: "bag-of-holding",
    category: "magic-items",
    nameRu: "Сумка хранения",
    nameEn: "Bag of Holding",
    subtitle: "Необычный",
    summary: "500 фунтов, карманное измерение",
    body: `**Редкость:** необычный

Внутреннее пространство 64 куб. фута, до 500 фунтов. Вес всегда 15 фунтов. Разрыв в эфир опасен.`,
    tags: ["контейнер"],
  },
  {
    key: "cloak-of-protection",
    category: "magic-items",
    nameRu: "Плащ защиты",
    nameEn: "Cloak of Protection",
    subtitle: "Необычный",
    summary: "+1 КД и спасброски",
    body: `**Настройка:** да · **Редкость:** необычный

+1 к КД и спасброскам, пока носите плащ.`,
    tags: ["доспех"],
  },
  {
    key: "ring-of-protection",
    category: "magic-items",
    nameRu: "Кольцо защиты",
    nameEn: "Ring of Protection",
    subtitle: "Редкий",
    summary: "+1 КД и спасброски",
    body: `**Настройка:** да · **Редкость:** редкий

+1 к КД и спасброскам.`,
    tags: [],
  },
  {
    key: "wand-of-magic-missiles",
    category: "magic-items",
    nameRu: "Палочка волшебных стрел",
    nameEn: "Wand of Magic Missiles",
    subtitle: "Необычный",
    summary: "7 зарядов, волшебная стрела",
    body: `**Редкость:** необычный · **Заряды:** 7

Тратите заряды, чтобы наложить **волшебную стрелу** (1 заряд = 1 уровень). Восстановление 1d6+1 зарядов на рассвете.`,
    tags: [],
  },
  {
    key: "weapon-plus-one",
    category: "magic-items",
    nameRu: "Оружие +1",
    nameEn: "+1 Weapon",
    subtitle: "Необычный",
    summary: "+1 к атаке и урону",
    body: `**Редкость:** необычный

Магическое оружие: **+1** к броскам атаки и урона.`,
    tags: ["оружие"],
  },
  {
    key: "shield-plus-one",
    category: "magic-items",
    nameRu: "Щит +1",
    nameEn: "+1 Shield",
    subtitle: "Редкий",
    summary: "+3 к КД вместо +2",
    body: `**Редкость:** редкий

Щит даёт **+3** к КД вместо обычных +2.`,
    tags: [],
  },
  {
    key: "boots-of-speed",
    category: "magic-items",
    nameRu: "Сапоги скорости",
    nameEn: "Boots of Speed",
    subtitle: "Редкий",
    summary: "Удвоение скорости",
    body: `**Настройка:** да

Щелчок пятками: скорость ×2 на 10 мин (1/короткий отдых). Снимаются — эффект прекращается.`,
    tags: [],
  },
  {
    key: "pearl-of-power",
    category: "magic-items",
    nameRu: "Жемчужина силы",
    nameEn: "Pearl of Power",
    subtitle: "Необычный",
    summary: "Восстановление ячейки",
    body: `**Настройка:** заклинатель · **1/день**

Восстанавливает одну потраченную ячейку заклинаний 3 уровня или ниже.`,
    tags: [],
  },
  {
    key: "immovable-rod",
    category: "magic-items",
    nameRu: "Неподвижный стержень",
    nameEn: "Immovable Rod",
    subtitle: "Необычный",
    summary: "Фиксация в пространстве",
    body: `Кнопка: стержень не двигается (выдерживает до 8000 фунтов). Повторное нажатие — снова обычный.`,
    tags: [],
  },
  {
    key: "rope-of-climbing",
    category: "magic-items",
    nameRu: "Верёвка лазания",
    nameEn: "Rope of Climbing",
    subtitle: "Необычный",
    summary: "60 футов, лазает сама",
    body: `60 футов верёвки. Команда — крепится, лазает, связывает узлы по указанию.`,
    tags: [],
  },
  {
    key: "sending-stones",
    category: "magic-items",
    nameRu: "Камни послания",
    nameEn: "Sending Stones",
    subtitle: "Необычный",
    summary: "Пара камней, Sending",
    body: `Пара камней. **1/день** — короткое сообщение на любое расстояние на одном плане (как заклинание *Послание*).`,
    tags: [],
  },
  {
    key: "gauntlets-of-ogre-power",
    category: "magic-items",
    nameRu: "Перчатки силы огра",
    nameEn: "Gauntlets of Ogre Power",
    subtitle: "Необычный",
    summary: "Сила 19",
    body: `**Настройка:** да · Сила становится **19**, если была ниже.`,
    tags: [],
  },
  {
    key: "helm-of-comprehending-languages",
    category: "magic-items",
    nameRu: "Шлем понимания языков",
    nameEn: "Helm of Comprehending Languages",
    subtitle: "Необычный",
    summary: "Понимание любой речи",
    body: `1/день — понимаете любую устную речь. Также можете читать письменность неизвестных языков (не секретные шифры).`,
    tags: [],
  },
  {
    key: "deck-of-many-things",
    category: "magic-items",
    nameRu: "Колода многих вещей",
    nameEn: "Deck of Many Things",
    subtitle: "Легендарный",
    summary: "13 карт — мощные эффекты",
    body: `**Осторожно!** Вытягивание карт меняет судьбу персонажа (богатство, уровни, проклятия, тюрьма и т.д.). Используйте осознанно на столе.`,
    tags: ["легендарный"],
  },
];
