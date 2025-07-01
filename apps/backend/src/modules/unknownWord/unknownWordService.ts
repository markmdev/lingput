import { CreateUnknownWordDTO } from "./unknownWord.types";
import { UnknownWord } from "@prisma/client";
import { UnknownWordRepository } from "./unknownWordRepository";
import { RedisStoryCache } from "@/cache/redisStoryCache";
import { queues } from "../jobs/queue";

export class UnknownWordService {
  constructor(
    private unknownWordRepository: UnknownWordRepository,
    private redisStoryCache: RedisStoryCache
  ) {}
  async saveUnknownWords(
    unknownWords: CreateUnknownWordDTO[],
    storyId: number,
    userId: number
  ): Promise<UnknownWord[]> {
    const existingWords = await this.unknownWordRepository.getUnknownWords(userId);
    const existingWordsMap = this.createWordsMap(existingWords);

    const { wordsToSave, wordsToUpdate } = this.partitionWords(unknownWords, existingWordsMap);

    const updatedWords = await this.updateExistingWords(wordsToUpdate, storyId, userId);
    const savedWords = await this.unknownWordRepository.saveUnknownWords(wordsToSave);

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
          exampleSentence: word.exampleSentence,
          exampleSentenceTranslation: word.exampleSentenceTranslation,
        });
      } else {
        wordsToSave.push(word);
      }
    }

    return { wordsToSave, wordsToUpdate };
  }

  private async updateExistingWords(
    wordsToUpdate: UnknownWord[],
    storyId: number,
    userId: number
  ): Promise<UnknownWord[]> {
    const tasks = wordsToUpdate.map((word) =>
      this.unknownWordRepository.updateTimesSeenAndConnectStory(word.id, word.timesSeen, storyId)
    );
    await this.redisStoryCache.invalidateStoryCache(userId);
    return await Promise.all(tasks);
  }

  async markAsLearned(wordId: number, userId: number) {
    const job = await queues.wordStatuses.add("mark-as-learned", {
      wordId,
      userId,
      wordStatus: "learned",
    });
    return { queueName: queues.wordStatuses.name, jobId: job.id };
  }

  async markAsLearning(wordId: number, userId: number) {
    const job = await queues.wordStatuses.add("mark-as-learning", {
      wordId,
      userId,
      wordStatus: "learning",
    });
    return { queueName: queues.wordStatuses.name, jobId: job.id };
  }

  async getUnknownWords(userId: number): Promise<UnknownWord[]> {
    return this.unknownWordRepository.getUnknownWords(userId);
  }
}
