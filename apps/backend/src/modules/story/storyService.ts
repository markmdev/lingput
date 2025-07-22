import { StoryRepository } from "./storyRepository";
import { CreateStoryDTO, StoryWithUnknownWords } from "./story.types";
import { Story, UnknownWord } from "@prisma/client";
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

export class StoriesService {
  constructor(
    private storyRepository: StoryRepository,
    private storyAssembler: StoryAssembler,
    private lemmaAssembler: LemmaAssembler,
    private audioAssembler: AudioAssembler,
    private redisStoryCache: RedisStoryCache,
    private jobQueue: Queue,
    private unknownWordService: UnknownWordService
  ) {}

  async generateFullStoryExperience(
    userId: number,
    languageCode: LanguageCode,
    originalLanguageCode: LanguageCode,
    subject: string = ""
  ) {
    const job = await this.jobQueue.add("generateStory", {
      userId,
      languageCode,
      originalLanguageCode,
      subject,
    });

    return { jobId: job.id };
  }

  async processStoryGenerationJob(job: Job): Promise<StoryWithUnknownWords> {
    const { userId, languageCode, originalLanguageCode, subject } = job.data;
    if (!userId || !languageCode || !originalLanguageCode || !subject) {
      throw new CustomError("Unable to generate a story: Invalud parameters", 500, null, {
        data: job.data,
      });
    }

    console.log("Creating a story");

    const { story, unknownWords, knownWords } = await this.createStory(
      subject,
      userId,
      languageCode,
      originalLanguageCode,
      job
    );

    console.log("Created a story");

    job.updateProgress({ phase: GENERATION_PHASES["saving"] });
    const savedStory = await this.saveStoryToDB(story);
    const savedUnknownWords = await this.unknownWordService.saveUnknownWords(
      unknownWords,
      savedStory.id,
      userId
    );

    const unknownWordIds = this.extractUnknownWordIds(savedUnknownWords);
    const storyWithUnknownWords = await this.connectUnknownWords(savedStory.id, unknownWordIds);

    return storyWithUnknownWords;
  }

  private async createStory(
    subject: string,
    userId: number,
    languageCode: "DE",
    originalLanguageCode: "EN",
    job: Job
  ) {
    const { story, fullTranslation, translationChunks, knownWords } =
      await this.storyAssembler.assemble(subject, userId, languageCode, originalLanguageCode, job);

    console.log("Story generated");
    const unknownWords = await this.lemmaAssembler.assemble(
      story,
      knownWords,
      userId,
      languageCode,
      originalLanguageCode,
      job
    );
    job.updateProgress({ phase: GENERATION_PHASES["creatingAudio"] });
    const audioUrl = await this.audioAssembler.assemble(
      translationChunks,
      unknownWords,
      languageCode,
      originalLanguageCode
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

  private async saveStoryToDB(story: CreateStoryDTO): Promise<Story> {
    const res = await this.storyRepository.saveStoryToDB(story);
    try {
      await this.redisStoryCache.invalidateStoryCache(story.userId);
    } catch (error) {
      logger.error("Failed invalidating story cache", error);
    }
    return res;
  }

  async getAllStories(userId: number): Promise<Story[]> {
    const cachedStories = await this.redisStoryCache.getAllStoriesFromCache(userId);
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
    wordIds: { id: number }[]
  ): Promise<StoryWithUnknownWords> {
    return await this.storyRepository.connectUnknownWords(storyId, wordIds);
  }

  private extractUnknownWordIds(unknownWords: UnknownWord[]): { id: number }[] {
    return unknownWords.map((word) => ({
      id: word.id,
    }));
  }
}
