import {
  UnknownWord,
  UnknownWordDraft,
  UnknownWordDB,
  isUnknownWordDB,
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

    const existingWordsResponse = await unknownWordRepository.getUnknownWords();
    if (existingWordsResponse.error) {
      throw new Error(existingWordsResponse.error.message);
    }

    if (!existingWordsResponse.data) {
      throw new Error(
        "No data returned from unknownWordRepository.saveUnknownWords()"
      );
    }

    const existingWords = existingWordsResponse.data;
    const existingWordsMap = new Map(
      existingWords.map((word) => [word.word.toLowerCase(), word])
    );

    const wordsToSave = [];
    const wordsToUpdate = [];

    for (const word of unknownWordsWithStoryId) {
      const existingWord = existingWordsMap.get(word.word.toLowerCase());
      if (existingWord) {
        wordsToUpdate.push({
          ...existingWord,
          times_seen: existingWord.times_seen + 1,
        });
      } else {
        wordsToSave.push(word);
      }
    }

    const tasks = wordsToUpdate.map((word) =>
      unknownWordRepository.updateTimesSeen(word.id, word.times_seen)
    );

    const updatedWordsResponse = await Promise.all(tasks);
    if (updatedWordsResponse.some((response) => response.error)) {
      throw new Error(
        updatedWordsResponse.find((response) => response.error)?.error?.message
      );
    }
    const updatedWords = updatedWordsResponse.map((response) => response.data);
    if (updatedWords.some((word) => !isUnknownWordDB(word))) {
      throw new Error(
        "No data returned from unknownWordRepository.updateTimesSeen()"
      );
    }
    const safeUpdatedWords = updatedWords as UnknownWordDB[];

    const response = await unknownWordRepository.saveUnknownWords(wordsToSave);

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error(
        "No data returned from unknownWordRepository.saveUnknownWords()"
      );
    }

    return [...safeUpdatedWords, ...response.data];
  }

  async markAsLearned(wordId: number) {
    const response = await unknownWordRepository.markAsLearned(wordId);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return null;
  }

  async markAsLearning(wordId: number) {
    const response = await unknownWordRepository.markAsLearning(wordId);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return null;
  }
}
