export interface UnknownWord {
  id: number;
  word: string;
  translation: string;
  article: string | null;
  status: "learned" | "learning";
  timesSeen: number;
  exampleSentence: string;
  exampleSentenceTranslation: string;
}

export interface Story {
  id: number;
  storyText: string;
  translationText: string;
  audioUrl: string;
  unknownWords: UnknownWord[];
  userId: number;
}
