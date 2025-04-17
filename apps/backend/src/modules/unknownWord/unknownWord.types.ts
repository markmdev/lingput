export interface CreateUnknownWordDTO {
  userId: number;
  word: string;
  translation: string;
  article: string | null;
  exampleSentence: string;
  exampleSentenceTranslation: string;
  timesSeen?: 1;
  status?: "learning";
}
