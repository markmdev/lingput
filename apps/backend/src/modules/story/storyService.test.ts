import { CreateUnknownWordDTO } from "../unknownWord/unknownWord.types";
import { AudioAssembler } from "./services/audioAssembler/audioAssembler";
import { LemmaAssembler } from "./services/lemmaAssembler/lemmaAssembler";
import { StoryAssembler } from "./services/storyAssembler/storyAssembler";
import { StoryRepository } from "./storyRepository";
import { StoriesService } from "./storyService";
import { RedisStoryCache } from "@/cache/redisStoryCache";
import { Queue, Job } from "bullmq";
import { UnknownWordService } from "../unknownWord/unknownWordService";
import { RedisStoryLimits } from "@/cache/redisStoryLimits";

// Silence logger in this test file
jest.mock("@/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const assembledStoryMock = {
  story: "Der Hund jagt die Katze.",
  knownWords: [
    {
      word: "Hund",
      translation: "Dog",
      article: "der",
      id: 1,
      userId: 1,
    },
  ],
  fullTranslation: "The dog chases the cat.",
  translationChunks: [
    {
      chunk: "Der Hund jagt die Katze.",
      translatedChunk: "The dog chases the cat.",
    },
  ],
};

const unknownWordsMock: CreateUnknownWordDTO[] = [
  {
    userId: 1,
    word: "Katze",
    translation: "Cat",
    article: "die",
    exampleSentence: "The cat is a small animal.",
    exampleSentenceTranslation: "Die Katze ist ein kleines Tier.",
  },
  {
    userId: 1,
    word: "jagen",
    translation: "to chase",
    article: null,
    exampleSentence: "The dog chases the cat.",
    exampleSentenceTranslation: "Der Hund jagt die Katze.",
  },
];

describe("StoriesService", () => {
  it("generateFullStoryExperience enqueues a job and returns jobId", async () => {
    const storyRepositoryMock = {} as unknown as StoryRepository;
    const storyAssemblerMock = {} as unknown as StoryAssembler;
    const lemmaAssemblerMock = {} as unknown as LemmaAssembler;
    const audioAssemblerMock = {} as unknown as AudioAssembler;
    const redisStoryCacheMock = {} as unknown as RedisStoryCache;
    const redisStoryLimitsMock = {
      isLimitReached: jest.fn().mockResolvedValue(false),
      incrementCount: jest.fn().mockResolvedValue(undefined),
      decrementCount: jest.fn().mockResolvedValue(undefined),
    } as unknown as RedisStoryLimits;

    const jobStub = {
      id: "job-123",
      updateProgress: jest.fn(),
    } as unknown as Job;
    const jobQueueMock = {
      add: jest.fn().mockResolvedValue(jobStub),
    } as unknown as Queue;
    const unknownWordServiceMock = {} as unknown as UnknownWordService;

    const service = new StoriesService(
      storyRepositoryMock,
      storyAssemblerMock,
      lemmaAssemblerMock,
      audioAssemblerMock,
      redisStoryCacheMock,
      jobQueueMock,
      unknownWordServiceMock,
      redisStoryLimitsMock,
    );

    const res = await service.generateFullStoryExperience(
      1,
      "DE",
      "EN",
      "Pets",
    );

    expect(res).toEqual({ jobId: "job-123" });
    expect((jobQueueMock as any).add).toHaveBeenCalledWith("generateStory", {
      userId: 1,
      languageCode: "DE",
      originalLanguageCode: "EN",
      subject: "Pets",
    });
    expect(jobStub.updateProgress).toHaveBeenCalled();
    expect((redisStoryLimitsMock as any).isLimitReached).toHaveBeenCalledWith(
      1,
    );
    expect((redisStoryLimitsMock as any).incrementCount).toHaveBeenCalledWith(
      1,
    );
  });

  it("processStoryGenerationJob runs full pipeline, saves data in transaction, invalidates cache", async () => {
    const storyRepositoryMock: any = {
      saveStoryToDB: jest
        .fn()
        .mockImplementation(async (story: any, tx: any) => ({
          id: 42,
          ...story,
        })),
      connectUnknownWords: jest
        .fn()
        .mockImplementation(
          async (storyId: number, wordIds: { id: number }[], tx: any) => ({
            id: storyId,
            storyText: "Der Hund jagt die Katze.",
            translationText: "The dog chases the cat.",
            audioUrl: "audioUrl",
            unknownWords: wordIds,
          }),
        ),
      getAllStories: jest.fn(),
    } as unknown as StoryRepository;

    const storyAssemblerMock = {
      assemble: jest.fn().mockResolvedValue(assembledStoryMock),
    } as unknown as StoryAssembler;

    const lemmaAssemblerMock = {
      assemble: jest.fn().mockResolvedValue(unknownWordsMock),
    } as unknown as LemmaAssembler;

    const audioAssemblerMock = {
      assemble: jest.fn().mockResolvedValue("audioUrl"),
    } as unknown as AudioAssembler;

    const redisStoryCacheMock = {
      invalidateStoryCache: jest.fn().mockResolvedValue(undefined),
      getAllStoriesFromCache: jest.fn().mockResolvedValue([]),
      saveStoriesToCache: jest.fn(),
    } as unknown as RedisStoryCache;

    const unknownWordServiceMock = {
      saveUnknownWords: jest.fn().mockResolvedValue([{ id: 100 }, { id: 101 }]),
    } as unknown as UnknownWordService;

    const redisStoryLimitsMock = {
      isLimitReached: jest.fn(),
      incrementCount: jest.fn(),
      decrementCount: jest.fn(),
    } as unknown as RedisStoryLimits;

    const job = {
      data: {
        userId: 1,
        languageCode: "DE",
        originalLanguageCode: "EN",
        subject: "Pets",
      },
      updateProgress: jest.fn(),
    } as unknown as Job;

    const tx = {} as any;
    const prisma = { $transaction: jest.fn(async (fn: any) => fn(tx)) } as any;

    const service = new StoriesService(
      storyRepositoryMock,
      storyAssemblerMock,
      lemmaAssemblerMock,
      audioAssemblerMock,
      redisStoryCacheMock,
      { add: jest.fn() } as unknown as Queue,
      unknownWordServiceMock,
      redisStoryLimitsMock,
    );

    const res = await service.processStoryGenerationJob(job, prisma);

    expect(storyAssemblerMock.assemble).toHaveBeenCalled();
    expect(lemmaAssemblerMock.assemble).toHaveBeenCalled();
    expect(audioAssemblerMock.assemble).toHaveBeenCalled();

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(storyRepositoryMock.saveStoryToDB).toHaveBeenCalled();
    expect(unknownWordServiceMock.saveUnknownWords).toHaveBeenCalledWith(
      unknownWordsMock,
      42,
      1,
      tx,
    );
    expect(storyRepositoryMock.connectUnknownWords).toHaveBeenCalled();
    expect(redisStoryCacheMock.invalidateStoryCache).toHaveBeenCalledWith(1);

    expect(res).toEqual({
      id: 42,
      storyText: "Der Hund jagt die Katze.",
      translationText: "The dog chases the cat.",
      audioUrl: "audioUrl",
      unknownWords: [{ id: 100 }, { id: 101 }].map((w) => ({ id: w.id })),
    });
  });
});
