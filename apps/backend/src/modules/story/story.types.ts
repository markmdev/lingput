import { Story, UnknownWord } from "@prisma/client";

export interface CreateStoryDTO {
  storyText: string;
  translationText: string;
  audioUrl: string;
  userId: number;
}

export interface Lemma {
  lemma: string;
  article: string | null;
  sentence: string;
}

export interface LemmaWithTranslation {
  lemma: string;
  translation: string;
  exampleSentence: string;
  exampleSentenceTranslation: string;
}

export interface StoryWithUnknownWords extends Story {
  unknownWords: UnknownWord[];
}
