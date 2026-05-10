/** Ключ записи каталога (латиница, стабильно в сохранёнках кампании). */
export type SrdMonsterCatalogKey = string;

/** Встроенное существо по открытым правилам (SRD 5e/OGL механика; не весь MM). */
export type SrdMonsterCatalogEntry = {
  key: SrdMonsterCatalogKey;
  /** Имя в SRD на английском (совпадает с эталоном по смыслу). */
  nameEn: string;
  cr: string;
  ac: number;
  hpAverage: number;
  speed: string;
  statsNote: string;
  extra: string;
};

export type SrdDeityPreset = {
  key: string;
  nameEn: string;
  domainSummary: string;
  alignment: string;
  suggestedWikiCategory: "deity";
};

/** Профиль «организации/культа» только из приложений SRD-пантеонов + нейтральные ярлыки. */
export type SrdFactionPresetEntry = {
  key: string;
  nameRu: string;
  nameEn?: string;
  notes: string;
};
