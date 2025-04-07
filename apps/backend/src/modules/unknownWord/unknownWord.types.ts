export type CreateUnknownWordDTO = {
  word: string;
  translation: string;
  article: string | null;
  exampleSentence: string;
  exampleSentenceTranslation: string;
  storyId: number | null;
  timesSeen?: 1;
  status?: "learning";
};

export type CreateUnknownWordWithStoryIdDTO = Omit<CreateUnknownWordDTO, "storyId"> & { storyId: number };
