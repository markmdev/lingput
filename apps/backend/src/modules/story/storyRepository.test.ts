import { StoryRepository } from "./storyRepository";
import { PrismaError } from "@/errors/PrismaError";
import { StorageError } from "@/errors/StorageError";

function prismaWithStory(overrides: any = {}) {
  return {
    story: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    ...overrides,
  } as any;
}

describe("StoryRepository", () => {
  it("getAllStories filters by userId, includes unknownWords, orders desc", async () => {
    const prisma = prismaWithStory();
    prisma.story.findMany.mockResolvedValue([{ id: 1 }] as any);
    const repo = new StoryRepository(prisma, {} as any);

    const res = await repo.getAllStories(5);

    expect(res).toEqual([{ id: 1 }]);
    expect(prisma.story.findMany).toHaveBeenCalledWith({
      where: { userId: 5 },
      include: { unknownWords: true },
      orderBy: { id: "desc" },
    });
  });

  it("getAllStories wraps errors", async () => {
    const prisma = prismaWithStory();
    prisma.story.findMany.mockRejectedValue(new Error("db"));
    const repo = new StoryRepository(prisma, {} as any);

    await expect(repo.getAllStories(1)).rejects.toBeInstanceOf(PrismaError);
  });

  it("saveStoryToDB creates story and returns it; wraps errors", async () => {
    const prisma = prismaWithStory();
    prisma.story.create.mockResolvedValue({ id: 10 } as any);
    const repo = new StoryRepository(prisma, {} as any);

    const res = await repo.saveStoryToDB({
      storyText: "s",
      translationText: "t",
      audioUrl: "a",
      userId: 1,
    } as any);
    expect(res).toEqual({ id: 10 });
    expect(prisma.story.create).toHaveBeenCalledWith({
      data: { storyText: "s", translationText: "t", audioUrl: "a", userId: 1 },
    });

    prisma.story.create.mockRejectedValue(new Error("db"));
    await expect(repo.saveStoryToDB({} as any)).rejects.toBeInstanceOf(
      PrismaError,
    );
  });

  it("saveStoryAudioToStorage uploads mp3 and returns path; wraps storage errors", async () => {
    const prisma = prismaWithStory();
    const storage = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest
            .fn()
            .mockResolvedValue({ data: { path: "path.mp3" }, error: null }),
        }),
      },
    } as any;

    const repo = new StoryRepository(prisma, storage);

    const res = await repo.saveStoryAudioToStorage("QkFTRTY0");
    expect(typeof res).toBe("string");

    // error branch
    const storageErr = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest
            .fn()
            .mockResolvedValue({ data: null, error: new Error("storage") }),
        }),
      },
    } as any;
    const repo2 = new StoryRepository(prisma, storageErr);
    await expect(
      repo2.saveStoryAudioToStorage("QkFTRTY0"),
    ).rejects.toBeInstanceOf(StorageError);
  });

  it("connectUnknownWords updates with connect and includes unknownWords; wraps errors", async () => {
    const prisma = prismaWithStory();
    prisma.story.update.mockResolvedValue({
      id: 1,
      unknownWords: [{ id: 2 }],
    } as any);
    const repo = new StoryRepository(prisma, {} as any);

    const res = await repo.connectUnknownWords(1, [{ id: 2 }]);
    expect(res).toEqual({ id: 1, unknownWords: [{ id: 2 }] });
    expect(prisma.story.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { unknownWords: { connect: [{ id: 2 }] } },
      include: { unknownWords: true },
    });

    prisma.story.update.mockRejectedValue(new Error("db"));
    await expect(
      repo.connectUnknownWords(1, [{ id: 2 }]),
    ).rejects.toBeInstanceOf(PrismaError);
  });

  it("methods use provided tx when present", async () => {
    const prisma = prismaWithStory();
    const tx = prismaWithStory();
    const repo = new StoryRepository(prisma, {} as any);

    tx.story.findMany.mockResolvedValue([]);
    await repo.getAllStories(1, tx);
    expect(tx.story.findMany).toHaveBeenCalled();

    tx.story.create.mockResolvedValue({});
    await repo.saveStoryToDB({} as any, tx);
    expect(tx.story.create).toHaveBeenCalled();

    tx.story.update.mockResolvedValue({});
    await repo.connectUnknownWords(1, [{ id: 2 }], tx);
    expect(tx.story.update).toHaveBeenCalled();
  });
});
