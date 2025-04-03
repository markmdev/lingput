import {
  UnknownWord,
  UnknownWordDraft,
  UnknownWordDB,
} from "./unknownWord.types";
import { UnknownWordRepository } from "./unknownWordRepository";

const unknownWordRepository = new UnknownWordRepository();

export class UnknownWordService {
  async saveUnknownWords(
    unknownWords: UnknownWordDraft[],
    story_id: number
  ): Promise<UnknownWordDB[]> {
    const unknownWordsWithStoryId: UnknownWord[] = unknownWords.map((word) => ({
      ...word,
      story_id,
    }));

    const response = await unknownWordRepository.saveUnknownWords(
      unknownWordsWithStoryId
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error("No data returned from unknownWordRepository");
    }

    return response.data;
  }
}
