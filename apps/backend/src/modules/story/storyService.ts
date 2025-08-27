import { StoryRepository } from "./storyRepository";
import { CreateStoryDTO, StoryWithUnknownWords } from "./story.types";
import { Prisma, PrismaClient, Story, UnknownWord } from "@prisma/client";
import { StoryAssembler } from "./services/storyAssembler/storyAssembler";
import { LemmaAssembler } from "./services/lemmaAssembler/lemmaAssembler";
import { AudioAssembler } from "./services/audioAssembler/audioAssembler";
import { LanguageCode } from "@/utils/languages";
import { RedisStoryCache } from "@/cache/redisStoryCache";
import { logger } from "@/utils/logger";
import { Job, Queue } from "bullmq";
import { CustomError } from "@/errors/CustomError";
import { UnknownWordService } from "../unknownWord/unknownWordService";
import { GENERATION_PHASES } from "./generationPhases";
import { RedisStoryLimits } from "@/cache/redisStoryLimits";

export class StoriesService {
  constructor(
    private storyRepository: StoryRepository,
    private storyAssembler: StoryAssembler,
    private lemmaAssembler: LemmaAssembler,
    private audioAssembler: AudioAssembler,
    private redisStoryCache: RedisStoryCache,
    private jobQueue: Queue,
    private unknownWordService: UnknownWordService,
    private redisStoryLimits: RedisStoryLimits,
  ) {}

  async generateFullStoryExperience(
    userId: number,
    languageCode: LanguageCode,
    originalLanguageCode: LanguageCode,
    subject: string = "",
  ) {
    const isLimitReached = await this.redisStoryLimits.isLimitReached(userId);
    if (isLimitReached) {
      throw new CustomError("Daily limit reached", 429, null);
    }
    await this.redisStoryLimits.incrementCount(userId);
    const job = await this.jobQueue.add("generateStory", {
      userId,
      languageCode,
      originalLanguageCode,
      subject,
    });

    logger.info(`Added job ${job.id} to the queue.`);
    job.updateProgress({
      phase: GENERATION_PHASES["starting"],
      totalSteps: Object.keys(GENERATION_PHASES).length,
    });

    return { jobId: job.id };
  }

  async processStoryGenerationJob(
    job: Job,
    prisma: PrismaClient,
  ): Promise<StoryWithUnknownWords> {
    const { userId, languageCode, originalLanguageCode, subject } = job.data;
    if (!userId || !languageCode || !originalLanguageCode || !subject) {
      throw new CustomError(
        "Unable to generate a story: Invalud parameters",
        500,
        null,
        {
          data: job.data,
        },
      );
    }

    const { story, unknownWords } = await this.createStory(
      subject,
      userId,
      languageCode,
      originalLanguageCode,
      job,
    );

    job.updateProgress({
      phase: GENERATION_PHASES["saving"],
      totalSteps: Object.keys(GENERATION_PHASES).length,
    });
    try {
      const storyWithUnknownWords = await prisma.$transaction(async (tx) => {
        const savedStory = await this.saveStoryToDB(story, tx);
        const savedUnknownWords =
          await this.unknownWordService.saveUnknownWords(
            unknownWords,
            savedStory.id,
            userId,
            tx,
          );
        const unknownWordIds = this.extractUnknownWordIds(savedUnknownWords);
        const storyWithUnknownWords = await this.connectUnknownWords(
          savedStory.id,
          unknownWordIds,
          tx,
        );
        return storyWithUnknownWords;
      });
      logger.info("Prisma transaction completed!");
      return storyWithUnknownWords;
    } catch (error) {
      logger.error("Prisma transaction failed", error);
      throw error;
    }
  }

  async decrementLimitCount(userId: number) {
    return this.redisStoryLimits.decrementCount(userId);
  }

  private async createStory(
    subject: string,
    userId: number,
    languageCode: "DE",
    originalLanguageCode: "EN",
    job: Job,
  ) {
    const { story, fullTranslation, translationChunks, knownWords } =
      await this.storyAssembler.assemble(
        subject,
        userId,
        languageCode,
        originalLanguageCode,
        job,
      );

    const unknownWords = await this.lemmaAssembler.assemble(
      story,
      knownWords,
      userId,
      languageCode,
      originalLanguageCode,
      job,
    );
    job.updateProgress({
      phase: GENERATION_PHASES["creatingAudio"],
      totalSteps: Object.keys(GENERATION_PHASES).length,
    });
    const audioUrl = await this.audioAssembler.assemble(
      translationChunks,
      unknownWords,
      languageCode,
      originalLanguageCode,
    );

    return {
      story: {
        storyText: story,
        translationText: fullTranslation,
        audioUrl,
        userId,
      },
      unknownWords,
      knownWords,
    };
  }

  private async saveStoryToDB(
    story: CreateStoryDTO,
    tx: Prisma.TransactionClient,
  ): Promise<Story> {
    const res = await this.storyRepository.saveStoryToDB(story, tx);
    try {
      await this.redisStoryCache.invalidateStoryCache(story.userId);
    } catch (error) {
      logger.error("Failed invalidating story cache", error);
    }
    return res;
  }

  async getAllStories(userId: number): Promise<Story[]> {
    const cachedStories =
      await this.redisStoryCache.getAllStoriesFromCache(userId);
    if (cachedStories.length > 0) {
      return cachedStories;
    }

    const stories = await this.storyRepository.getAllStories(userId);
    try {
      await this.redisStoryCache.saveStoriesToCache(userId, stories);
    } catch (error) {
      logger.warn("Redis cache error", { error, userId });
    }
    return stories;
  }

  private async connectUnknownWords(
    storyId: number,
    wordIds: { id: number }[],
    tx: Prisma.TransactionClient,
  ): Promise<StoryWithUnknownWords> {
    return await this.storyRepository.connectUnknownWords(storyId, wordIds, tx);
  }

  private extractUnknownWordIds(unknownWords: UnknownWord[]): { id: number }[] {
    return unknownWords.map((word) => ({
      id: word.id,
    }));
  }
}
