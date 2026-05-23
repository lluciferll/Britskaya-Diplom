/** Ключи интерактивных атласов на aidedd.org (встраиваются через iframe). */
export type AideddAtlasKey = "faerun" | "sword-coast" | "baldurs-gate" | "laelith";

export type MapWorkspaceTab = "watabou" | "faerun";

export type AideddAtlasOption = {
  key: AideddAtlasKey;
  labelRu: string;
  subtitle: string;
  /** Полный URL страницы атласа на aidedd.org */
  url: string;
};

/** Список карт с сайта Aidedd Atlas — тот же функционал, что на оригинале (поиск, лор, маркеры). */
export const AIDEDD_ATLAS_OPTIONS: AideddAtlasOption[] = [
  {
    key: "faerun",
    labelRu: "Faerûn",
    subtitle: "Весь континент · лор по клику · свои маркеры в браузере",
    url: "https://www.aidedd.org/atlas/faerun",
  },
  {
    key: "sword-coast",
    labelRu: "Побережье Меча",
    subtitle: "Sword Coast · детальнее запад Faerûn",
    url: "https://www.aidedd.org/atlas/index.php?l=1&map=R",
  },
  {
    key: "baldurs-gate",
    labelRu: "Baldur's Gate",
    subtitle: "Город и окрестности",
    url: "https://www.aidedd.org/atlas/index.php?map=B",
  },
  {
    key: "laelith",
    labelRu: "Laelith",
    subtitle: "Детальная карта Patrick Durand-Peyroles",
    url: "https://www.aidedd.org/atlas/index.php?l=1&map=L",
  },
];

export const DEFAULT_AIDEDD_ATLAS_KEY: AideddAtlasKey = "faerun";

export function getAideddAtlasOption(key: AideddAtlasKey | undefined): AideddAtlasOption {
  return AIDEDD_ATLAS_OPTIONS.find((o) => o.key === key) ?? AIDEDD_ATLAS_OPTIONS[0]!;
}

export function isAideddAtlasKey(v: string): v is AideddAtlasKey {
  return AIDEDD_ATLAS_OPTIONS.some((o) => o.key === v);
}

/** Базовый URL каталога атласов (выбор карты на стороне Aidedd). */
export const AIDEDD_ATLAS_HOME = "https://www.aidedd.org/atlas/";
