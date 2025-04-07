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
    story_id: number
  ): Promise<UnknownWord[]> {
    const unknownWordsWithStoryId: CreateUnknownWordWithStoryIdDTO[] =
      unknownWords.map((word) => ({
        ...word,
        storyId: story_id,
      }));

    const existingWords = await unknownWordRepository.getUnknownWords();

    const existingWordsMap = new Map(
      existingWords.map((word) => [word.word.toLowerCase(), word])
    );

    const wordsToSave: CreateUnknownWordWithStoryIdDTO[] = [];
    const wordsToUpdate: UnknownWord[] = [];

    for (const word of unknownWordsWithStoryId) {
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

    const tasks = wordsToUpdate.map((word) =>
      unknownWordRepository.updateTimesSeen(word.id, word.timesSeen)
    );

    const updatedWords = await Promise.all(tasks);

    const savedWords = await unknownWordRepository.saveUnknownWords(
      wordsToSave
    );

    return [...updatedWords, ...savedWords];
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
