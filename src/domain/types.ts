import type { CampaignForgeModules } from "@/domain/forgeModules";
import type { WatabouCityParams } from "@/lib/watabouCityUrl";
import type { AideddAtlasKey, MapWorkspaceTab } from "@/lib/aideddAtlas";

export type TimelineEntry = {
  id: string;
  title: string;
  inGameDate?: string;
  notes: string;
  createdAt: string;
};

export type Faction = {
  id: string;
  name: string;
  notes: string;
  /** Ключ строки каталога SRD-пресетов (культ/структура/приложение-пантеон). */
  srdPresetKey?: string;
};

export type LocationNode = {
  id: string;
  name: string;
  tier: "world" | "region" | "city" | "district" | "building";
  parentId?: string | null;
  notes: string;
};

/** Блок особенности / действия в статблоке персонажа (D&D 5e). */
export type StatBlockFeature = {
  id: string;
  name: string;
  text: string;
};

export type StatBlockAbilities = {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
};

/** Расширенный статблок NPC/PC — по образцу редактора Aidedd. */
export type CharacterStatBlock = {
  creatureType?: string;
  subtype?: string;
  size?: string;
  alignment?: string;
  ac?: string;
  hp?: string;
  speed?: string;
  abilities: StatBlockAbilities;
  savingThrows?: string;
  skills?: string;
  damageVulnerabilities?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses?: string;
  passivePerception?: string;
  languages?: string;
  cr?: string;
  proficiencyBonus?: string;
  traits: StatBlockFeature[];
  actions: StatBlockFeature[];
  bonusActions: StatBlockFeature[];
  reactions: StatBlockFeature[];
  legendaryActions: StatBlockFeature[];
  /** Описание существа / flavor-текст */
  description?: string;
};

export type CampaignCharacter = {
  id: string;
  name: string;
  kind: "npc" | "pc";
  summary: string;
  /** Теги: класс, раса, роль */
  tags?: string;
  personality?: string;
  secret?: string;
  motivation?: string;
  /** Подсказка статов для мастера (D&D 5e) */
  statHint?: string;
  /** Полный статблок (механика боя) */
  statBlock?: CharacterStatBlock;
  /** Партийный лист мастера (опционально) */
  currentHp?: number;
  maxHp?: number;
  tempHp?: number;
  ac?: number;
  passivePerception?: number;
  passiveInsight?: number;
  inspiration?: boolean;
  inventoryNotes?: string;
  /** То, что видит только мастер до выдачи */
  gmHiddenItems?: string;
  /** Журнал ужасов / напряжения — если включён модуль атмосферы */
  stress?: number;
};

export type Quest = {
  id: string;
  title: string;
  arc?: string;
  status: "active" | "done" | "paused";
  notes: string;
};

export type SessionLog = {
  id: string;
  title: string;
  startedAt: string;
  notes: string;
};

export type GalleryItem = {
  id: string;
  caption: string;
  url?: string;
  notes?: string;
};

export type Combatant = {
  id: string;
  name: string;
  initiative: number;
  /** Модификатор для быстрого броска d20 при инициативе (Dex и прочие бонусы). */
  initiativeBonus?: number;
  hp: number;
  maxHp: number;
  conditions: string;
};

export type DiceRollEntry = {
  id: string;
  rolledAt: string;
  /** Подпись для журнала (например имя бойца). */
  label?: string;
  formula: string;
  detail: string;
  total: number;
};

export type MapToken = {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
};

export type BattleMapState = {
  fogSize: number; // nxn grid overlay
  revealed: Record<string, true>;
  tokens: MapToken[];
  backgroundUrl?: string;
  gridPx: number;
  showGrid: boolean;
  /** Параметры встроенного генератора watabou (сохраняются с кампанией). */
  watabouCity?: WatabouCityParams;
  /** Последняя вкладка на экране карты кампании. */
  mapWorkspaceTab?: MapWorkspaceTab;
  /** Выбранный атлас Aidedd (Faerûn, Sword Coast…). */
  aideddAtlasKey?: AideddAtlasKey;
};

/** Статья вики внутри кампании ([[перекрёстные ссылки]]) */
export type WikiArticle = {
  id: string;
  slug: string;
  title: string;
  category: "city" | "faction" | "history" | "deity" | "item" | "person" | "creature" | "other";
  /** Текст; ссылки задаются как [[Название статьи]] или [[slug]] */
  body: string;
  /** Привязка к встроенному каталогу открытых правил SRD/OGL */
  srdRef?: { kind: "monster" | "deity"; key: string };
  createdAt: string;
  updatedAt: string;
};

export type SessionBlockKind =
  | "scene"
  | "note"
  | "music"
  | "wiki"
  | "monster"
  | "quickdrop";

export type SessionPlanBlock = {
  id: string;
  kind: SessionBlockKind;
  title: string;
  /** Основное содержание сцены, заметка, URL музыки, имя статблока и т.д. */
  content: string;
  /** Связка с элементом кампании (slug вики или id статблока) */
  refId?: string;
  order: number;
};

/** Одна намеченная игровая встреча / «эпизод» */
export type SessionPlanMeeting = {
  id: string;
  title: string;
  /** Произвольная подпись даты («вторая майская», «нетто вечер») */
  whenLabel?: string;
  narrativeOrder: number;
  blocks: SessionPlanBlock[];
  createdAt: string;
};

/** Редактор «монстр на лету» / импорт вручную */
export type MonsterStatblock = {
  id: string;
  name: string;
  cr: string;
  ac?: number;
  hpAverage?: number;
  speed?: string;
  statsNote?: string;
  /** Быстрое добавление особенностей, легендарных действий */ 
  extra?: string;
  sourceTag?: "srd_stub" | "homebrew" | "import";
  /** Ключ из встроенного каталога SRD (монстры общего набора Open Game Content). */
  srdCatalogKey?: string;
  /** Если статблок подставлен со статьи вики-существа. */
  linkedWikiArticleId?: string;
};

/** Сохранённая связка нескольких существ под расчёт */
export type EncounterBuild = {
  id: string;
  name: string;
  monsterQuantities: { monsterId: string; count: number }[];
  notes?: string;
};

/** «Drop»: готовый набор сцены как в вашем описании (без мультиплеера пока текстом) */
export type QuickDrop = {
  id: string;
  title: string;
  mapUrl?: string;
  sceneText?: string;
  monsterSnippet?: string;
  lootSnippet?: string;
  wikiLinks?: string[];
};

/** Тексты правил или PDF-оглавление (без OCR — заметки мастера) */
export type LibraryDocument = {
  id: string;
  title: string;
  scope: "rules" | "adventure" | "homebrew";
  summary: string;
  body: string;
  tags: string[];
};

export type HomebrewRecordKind = "spell" | "monster" | "item" | "race" | "subclass";

export type HomebrewRecord = {
  id: string;
  kind: HomebrewRecordKind;
  name: string;
  /**
   * Мини-схема «поля»: строчки key=value, позже можно импортировать в модуль столкновений.
   */
  definition: string;
};

export type LoreGraphManualEdge = {
  id: string;
  fromKind: "wiki" | "character" | "location" | "quest" | "faction";
  fromId: string;
  toKind: "wiki" | "character" | "location" | "quest" | "faction";
  toId: string;
  label?: string;
};

export type HorrorToolkitState = {
  enabled: boolean;
  stressCap: number;
  corruptionNotes: string;
  environmentNotes: string;
  /** Накопленная «порча» / угроза атмосферного модуля (шкала на усмотрение стола). */
  corruptionIndex: number;
  /** Величина шага N для кнопок ± и опционально для стресса. */
  corruptionStep: number;
  /** При +порча добавить N стресса всем PC (до лимита stressCap). */
  applyStressWithCorruption: boolean;
};

export type SessionStatePersisted = {
  timerStartedAt?: string | null;
  elapsedBeforePauseMs: number;
  paused: boolean;
  gmNotes: string;
  playerNotes: string;
  combatants: Combatant[];
  /** Последние броски кубиков (для стола мастера). */
  diceLog?: DiceRollEntry[];
};

export type Campaign = {
  id: string;
  title: string;
  system: string;
  partyLevel: number;
  tone: string;
  tags: string[];
  /** Вкладки и подсистемы: выключенное = скрыто без «мягких» заглушек. */
  modules: CampaignForgeModules;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEntry[];
  factions: Faction[];
  locations: LocationNode[];
  characters: CampaignCharacter[];
  quests: Quest[];
  sessionLogs: SessionLog[];
  gallery: GalleryItem[];
  session: SessionStatePersisted;
  map: BattleMapState;

  wikiArticles: WikiArticle[];
  sessionPlans: SessionPlanMeeting[];
  monsterBlocks: MonsterStatblock[];
  encounters: EncounterBuild[];
  quickDrops: QuickDrop[];
  libraryDocs: LibraryDocument[];
  homebrewDefinitions: HomebrewRecord[];
  loreGraphExtras: LoreGraphManualEdge[];
  horrorToolkit: HorrorToolkitState;
  /** Домашние правила и раздачи — текстом */
  houserulesMarkdown: string;
  /** Журнал выдачи лута / опыта — свободный текст или чеклист */
  lootAndRewardsLog: string;
};
