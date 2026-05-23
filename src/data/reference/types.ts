export type ReferenceCategoryId =
  | "spells"
  | "feats"
  | "invocations"
  | "magic-items"
  | "monsters"
  | "deities";

export type ReferenceEntry = {
  key: string;
  category: ReferenceCategoryId;
  /** Русское название (основное в UI). */
  nameRu: string;
  /** Английское имя SRD — для поиска и ссылок. */
  nameEn?: string;
  /** Короткая метка в списке: КО, уровень, редкость и т.д. */
  subtitle: string;
  /** Одна строка для списка. */
  summary: string;
  /** Полное описание (markdown-lite). */
  body: string;
  /** Дополнительные слова для поиска. */
  tags?: string[];
};

export type ReferenceCategory = {
  id: ReferenceCategoryId;
  labelRu: string;
  hint: string;
  icon: string;
};
