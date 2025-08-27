import { UnknownWordService } from "./unknownWordService";
import { UnknownWordRepository } from "./unknownWordRepository";
import { RedisStoryCache } from "@/cache/redisStoryCache";
import { Job, Queue } from "bullmq";
import { CustomError } from "@/errors/CustomError";
import { UnknownWord } from "@prisma/client";

function createQueueMock() {
  return {
    add: jest.fn().mockResolvedValue({ id: "job-1" }),
  } as unknown as Queue;
}

describe("UnknownWordService", () => {
  it("saveUnknownWords partitions by existing map (case-insensitive), updates timesSeen, connects story, and saves new", async () => {
    const existing: UnknownWord[] = [
      {
        id: 10,
        userId: 1,
        word: "Hund",
        translation: "Dog",
        article: "der",
        exampleSentence: "old",
        exampleSentenceTranslation: "alt",
        timesSeen: 2,
        status: "learning",
      },
    ];

    const repo: any = {
      getUnknownWords: jest.fn().mockResolvedValue(existing),
      updateTimesSeenAndConnectStory: jest.fn().mockResolvedValue({ id: 10 }),
      saveUnknownWords: jest.fn().mockResolvedValue([{ id: 11 }]),
    } as unknown as UnknownWordRepository;
    const cache = {} as unknown as RedisStoryCache;
    const queue = createQueueMock();

    const svc = new UnknownWordService(repo, cache, queue);

    const tx = {} as any;
    const input = [
      {
        userId: 1,
        word: "hund",
        translation: "Dog",
        article: "der",
        exampleSentence: "new ex",
        exampleSentenceTranslation: "neu",
      },
      {
        userId: 1,
        word: "Katze",
        translation: "Cat",
        article: "die",
        exampleSentence: "ex",
        exampleSentenceTranslation: "uex",
      },
    ];

    const result = await svc.saveUnknownWords(input as any, 999, 1, tx);

    // Updated first, then saved
    expect(repo.updateTimesSeenAndConnectStory).toHaveBeenCalledWith(
      10,
      3,
      999,
      tx,
    );
    expect(repo.saveUnknownWords).toHaveBeenCalledWith([input[1]], tx);
    expect(result).toEqual([{ id: 10 }, { id: 11 }]);
  });

  it("markAsLearned enqueues job and returns jobId", async () => {
    const repo = {} as unknown as UnknownWordRepository;
    const cache = {} as unknown as RedisStoryCache;
    const queue = createQueueMock();

    const svc = new UnknownWordService(repo, cache, queue);
    const res = await svc.markAsLearned(5, 2);

    expect((queue as any).add).toHaveBeenCalledWith("updateWordStatus", {
      wordId: 5,
      userId: 2,
      wordStatus: "learned",
    });
    expect(res).toEqual({ jobId: "job-1" });
  });

  it("markAsLearning enqueues job and returns jobId", async () => {
    const svc = new UnknownWordService({} as any, {} as any, createQueueMock());
    const res = await svc.markAsLearning(7, 3);
    expect((svc as any).jobQueue.add).toHaveBeenCalledWith("updateWordStatus", {
      wordId: 7,
      userId: 3,
      wordStatus: "learning",
    });
    expect(res).toEqual({ jobId: "job-1" });
  });

  it("processUpdateWordStatus throws CustomError when fields missing", async () => {
    const svc = new UnknownWordService({} as any, {} as any, {} as any);
    const badJob = { data: {} } as unknown as Job;
    await expect(svc.processUpdateWordStatus(badJob)).rejects.toBeInstanceOf(
      CustomError,
    );
  });

  it("processUpdateWordStatus updates learned and invalidates cache", async () => {
    const repo: any = {
      markAsLearned: jest.fn().mockResolvedValue({}),
      markAsLearning: jest.fn(),
    } as unknown as UnknownWordRepository;
    const cache: any = {
      invalidateStoryCache: jest.fn().mockResolvedValue(undefined),
    } as unknown as RedisStoryCache;
    const svc = new UnknownWordService(repo, cache, {} as any);

    const job = {
      data: { wordId: 1, userId: 2, wordStatus: "learned" },
    } as unknown as Job;
    const res = await svc.processUpdateWordStatus(job);

    expect(repo.markAsLearned).toHaveBeenCalledWith(1, 2);
    expect(cache.invalidateStoryCache).toHaveBeenCalledWith(2);
    expect(res).toEqual({ success: true });
  });

  it("processUpdateWordStatus updates learning and invalidates cache", async () => {
    const repo: any = {
      markAsLearning: jest.fn().mockResolvedValue({}),
      markAsLearned: jest.fn(),
    } as unknown as UnknownWordRepository;
    const cache: any = {
      invalidateStoryCache: jest.fn().mockResolvedValue(undefined),
    } as unknown as RedisStoryCache;
    const svc = new UnknownWordService(repo, cache, {} as any);

    const job = {
      data: { wordId: 3, userId: 4, wordStatus: "learning" },
    } as unknown as Job;
    const res = await svc.processUpdateWordStatus(job);

    expect(repo.markAsLearning).toHaveBeenCalledWith(3, 4);
    expect(cache.invalidateStoryCache).toHaveBeenCalledWith(4);
    expect(res).toEqual({ success: true });
  });
});
