import { CreateUnknownWordDTO } from "./unknownWord.types";
import { UnknownWord } from "@prisma/client";
import { UnknownWordRepository } from "./unknownWordRepository";

const unknownWordRepository = new UnknownWordRepository();

export class UnknownWordService {
  async saveUnknownWords(unknownWords: CreateUnknownWordDTO[], storyId: number): Promise<UnknownWord[]> {
    const existingWords = await unknownWordRepository.getUnknownWords();
    const existingWordsMap = this.createWordsMap(existingWords);

    const { wordsToSave, wordsToUpdate } = this.partitionWords(unknownWords, existingWordsMap);

    const updatedWords = await this.updateExistingWords(wordsToUpdate, storyId);
    const savedWords = await unknownWordRepository.saveUnknownWords(wordsToSave);

    return [...updatedWords, ...savedWords];
  }

  private createWordsMap(words: UnknownWord[]): Map<string, UnknownWord> {
    return new Map(words.map((word) => [word.word.toLowerCase(), word]));
  }

  private partitionWords(
    unknownWords: CreateUnknownWordDTO[],
    existingWordsMap: Map<string, UnknownWord>
  ): {
    wordsToSave: CreateUnknownWordDTO[];
    wordsToUpdate: UnknownWord[];
  } {
    const wordsToSave: CreateUnknownWordDTO[] = [];
    const wordsToUpdate: UnknownWord[] = [];

    for (const word of unknownWords) {
      const existingWord = existingWordsMap.get(word.word.toLowerCase());
      if (existingWord) {
        wordsToUpdate.push({
          ...existingWord,
          timesSeen: existingWord.timesSeen + 1,
        });
      } else {
        wordsToSave.push(word);
      }
    }

    return { wordsToSave, wordsToUpdate };
  }

  private async updateExistingWords(wordsToUpdate: UnknownWord[], storyId: number): Promise<UnknownWord[]> {
    const tasks = wordsToUpdate.map((word) =>
      unknownWordRepository.updateTimesSeenAndConnectStory(word.id, word.timesSeen, storyId)
    );

    return await Promise.all(tasks);
  }

  async markAsLearned(wordId: number) {
    await unknownWordRepository.markAsLearned(wordId);
  }

  async markAsLearning(wordId: number) {
    await unknownWordRepository.markAsLearning(wordId);
  }

  async getUnknownWords(): Promise<UnknownWord[]> {
    return unknownWordRepository.getUnknownWords();
  }
}
