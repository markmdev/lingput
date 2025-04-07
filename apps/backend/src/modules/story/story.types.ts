import { CreateUnknownWordDTO } from "../unknownWord/unknownWord.types";

export type CreateStoryDTO = {
  storyText: string;
  translationText: string;
  audioUrl: string;
  unknownWords: CreateUnknownWordDTO[];
};

export type Lemma = {
  lemma: string;
  article: string | null;
  sentence: string;
};

export type LemmaWithTranslation = {
  lemma: string;
  translation: string;
  exampleSentence: string;
  exampleSentenceTranslation: string;
};
