export interface VocabularyItem {
  id: number;
  word: string;
  translation: string;
  article: string | null;
  userId: number;
}
