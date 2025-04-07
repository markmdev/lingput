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

export type CreateUnknownWordWithStoryIdDTO = Omit<
  CreateUnknownWordDTO,
  "storyId"
> & { storyId: number };

export function isUnknownWordDB(word: any): word is CreateUnknownWordDTO {
  return (
    typeof word === "object" &&
    typeof word.id === "number" &&
    typeof word.word === "string" &&
    typeof word.times_seen === "number" &&
    typeof word.story_id === "number"
  );
}
