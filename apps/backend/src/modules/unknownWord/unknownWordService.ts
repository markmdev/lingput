import {
  CreateUnknownWordDTO,
  CreateUnknownWordWithStoryIdDTO,
} from "./unknownWord.types";
import { UnknownWord } from "@prisma/client";
import { UnknownWordRepository } from "./unknownWordRepository";

const unknownWordRepository = new UnknownWordRepository();

export class UnknownWordService {
  async saveUnknownWords(
    unknownWords: CreateUnknownWordDTO[],
    storyId: number
  ): Promise<UnknownWord[]> {
    const existingWords = await unknownWordRepository.getUnknownWords();
    const existingWordsMap = this.createWordsMap(existingWords);

    const { wordsToSave, wordsToUpdate } = this.partitionWords(
      unknownWords,
      existingWordsMap,
      storyId
    );

    const updatedWords = await this.updateExistingWords(wordsToUpdate);
    const savedWords = await unknownWordRepository.saveUnknownWords(
      wordsToSave
    );

    return [...updatedWords, ...savedWords];
  }

  private createWordsMap(words: UnknownWord[]): Map<string, UnknownWord> {
    return new Map(words.map((word) => [word.word.toLowerCase(), word]));
  }

  private partitionWords(
    unknownWords: CreateUnknownWordDTO[],
    existingWordsMap: Map<string, UnknownWord>,
    storyId: number
  ): {
    wordsToSave: CreateUnknownWordWithStoryIdDTO[];
    wordsToUpdate: UnknownWord[];
  } {
    const wordsToSave: CreateUnknownWordWithStoryIdDTO[] = [];
    const wordsToUpdate: UnknownWord[] = [];

    for (const word of unknownWords) {
      const existingWord = existingWordsMap.get(word.word.toLowerCase());
      if (existingWord) {
        wordsToUpdate.push({
          ...existingWord,
          timesSeen: existingWord.timesSeen + 1,
        });
      } else {
        wordsToSave.push({ ...word, storyId });
      }
    }

    return { wordsToSave, wordsToUpdate };
  }

  private async updateExistingWords(
    wordsToUpdate: UnknownWord[]
  ): Promise<UnknownWord[]> {
    const tasks = wordsToUpdate.map((word) =>
      unknownWordRepository.updateTimesSeen(word.id, word.timesSeen)
    );

    return await Promise.all(tasks);
  }

  async markAsLearned(wordId: number) {
    const response = await unknownWordRepository.markAsLearned(wordId);

    return null;
  }

  async markAsLearning(wordId: number) {
    const response = await unknownWordRepository.markAsLearning(wordId);

    return null;
  }
}
