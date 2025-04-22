export interface CreateUnknownWordDTO {
  userId: number;
  word: string;
  translation: string;
  article: string | null;
  exampleSentence: string;
  exampleSentenceTranslation: string;
  timesSeen?: number;
  status?: "learning" | "learned";
}
