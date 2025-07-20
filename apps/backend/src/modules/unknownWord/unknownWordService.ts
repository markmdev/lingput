import { CreateUnknownWordDTO } from "./unknownWord.types";
import { UnknownWord } from "@prisma/client";
import { UnknownWordRepository } from "./unknownWordRepository";
import { RedisStoryCache } from "@/cache/redisStoryCache";
import { CustomError } from "@/errors/CustomError";
import { Queue } from "bullmq";

export class UnknownWordService {
  constructor(
    private unknownWordRepository: UnknownWordRepository,
    private redisStoryCache: RedisStoryCache,
    private jobQueue: Queue
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
    const job = await this.jobQueue.add("updateWordStatus", {
      wordId,
      userId,
      wordStatus: "learned",
    });
    return { jobId: job.id };
  }

  async markAsLearning(wordId: number, userId: number) {
    const job = await this.jobQueue.add("updateWordStatus", {
      wordId,
      userId,
      wordStatus: "learning",
    });
    return { jobId: job.id };
  }

  async processUpdateWordStatus(jobData: any) {
    const wordId = jobData.wordId;
    const userId = jobData.userId;
    const wordStatus = jobData.wordStatus;
    if (!wordId || !userId || !wordStatus) {
      throw new CustomError("Unable to update word status", 500, null, { jobData });
    }

    if (wordStatus === "learned") {
      await this.unknownWordRepository.markAsLearned(wordId, userId);
    } else {
      await this.unknownWordRepository.markAsLearning(wordId, userId);
    }
    await this.redisStoryCache.invalidateStoryCache(userId);
    return { success: true };
  }

  async getUnknownWords(userId: number): Promise<UnknownWord[]> {
    return this.unknownWordRepository.getUnknownWords(userId);
  }
}
