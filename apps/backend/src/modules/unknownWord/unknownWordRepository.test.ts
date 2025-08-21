import { UnknownWordRepository } from "./unknownWordRepository";
import { PrismaError } from "@/errors/PrismaError";

function prismaWithUnknownWord(overrides: any = {}) {
  return {
    unknownWord: {
      createManyAndReturn: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    ...overrides,
  } as any;
}

describe("UnknownWordRepository", () => {
  it("saveUnknownWords uses client and returns created rows", async () => {
    const prisma = prismaWithUnknownWord();
    prisma.unknownWord.createManyAndReturn.mockResolvedValue([{ id: 1 }] as any);
    const repo = new UnknownWordRepository(prisma);

    const res = await repo.saveUnknownWords([{ word: "Hund" } as any]);
    expect(res).toEqual([{ id: 1 }]);
    expect(prisma.unknownWord.createManyAndReturn).toHaveBeenCalledWith({
      data: [{ word: "Hund" }],
    });
  });

  it("saveUnknownWords wraps errors", async () => {
    const prisma = prismaWithUnknownWord();
    prisma.unknownWord.createManyAndReturn.mockRejectedValue(new Error("db"));
    const repo = new UnknownWordRepository(prisma);
    await expect(repo.saveUnknownWords([] as any)).rejects.toBeInstanceOf(PrismaError);
  });

  it("markAsLearned updates by id+userId and returns row", async () => {
    const prisma = prismaWithUnknownWord();
    prisma.unknownWord.update.mockResolvedValue({ id: 2 });
    const repo = new UnknownWordRepository(prisma);

    const res = await repo.markAsLearned(2, 1);
    expect(res).toEqual({ id: 2 });
    expect(prisma.unknownWord.update).toHaveBeenCalledWith({
      where: { id: 2, userId: 1 },
      data: { status: "learned" },
    });
  });

  it("markAsLearning updates by id+userId and returns row", async () => {
    const prisma = prismaWithUnknownWord();
    prisma.unknownWord.update.mockResolvedValue({ id: 3 });
    const repo = new UnknownWordRepository(prisma);

    const res = await repo.markAsLearning(3, 1);
    expect(res).toEqual({ id: 3 });
    expect(prisma.unknownWord.update).toHaveBeenCalledWith({
      where: { id: 3, userId: 1 },
      data: { status: "learning" },
    });
  });

  it("markAsLearned wraps errors", async () => {
    const prisma = prismaWithUnknownWord();
    prisma.unknownWord.update.mockRejectedValue(new Error("db"));
    const repo = new UnknownWordRepository(prisma);
    await expect(repo.markAsLearned(1, 1)).rejects.toBeInstanceOf(PrismaError);
  });

  it("getUnknownWords filters by userId and returns rows", async () => {
    const prisma = prismaWithUnknownWord();
    prisma.unknownWord.findMany.mockResolvedValue([{ id: 1 }]);
    const repo = new UnknownWordRepository(prisma);

    const res = await repo.getUnknownWords(5);
    expect(res).toEqual([{ id: 1 }]);
    expect(prisma.unknownWord.findMany).toHaveBeenCalledWith({ where: { userId: 5 } });
  });

  it("getUnknownWords wraps errors", async () => {
    const prisma = prismaWithUnknownWord();
    prisma.unknownWord.findMany.mockRejectedValue(new Error("db"));
    const repo = new UnknownWordRepository(prisma);
    await expect(repo.getUnknownWords(1)).rejects.toBeInstanceOf(PrismaError);
  });

  it("updateTimesSeenAndConnectStory updates timesSeen and connects story", async () => {
    const prisma = prismaWithUnknownWord();
    prisma.unknownWord.update.mockResolvedValue({ id: 9 });
    const repo = new UnknownWordRepository(prisma);

    const res = await repo.updateTimesSeenAndConnectStory(9, 3, 77);
    expect(res).toEqual({ id: 9 });
    expect(prisma.unknownWord.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { timesSeen: 3, stories: { connect: { id: 77 } } },
    });
  });

  it("updateTimesSeenAndConnectStory wraps errors", async () => {
    const prisma = prismaWithUnknownWord();
    prisma.unknownWord.update.mockRejectedValue(new Error("db"));
    const repo = new UnknownWordRepository(prisma);
    await expect(repo.updateTimesSeenAndConnectStory(1, 1, 1)).rejects.toBeInstanceOf(PrismaError);
  });

  it("methods use provided transaction client when present", async () => {
    const prisma = prismaWithUnknownWord();
    const tx = prismaWithUnknownWord();
    const repo = new UnknownWordRepository(prisma);

    tx.unknownWord.createManyAndReturn.mockResolvedValue([]);
    await repo.saveUnknownWords([], tx);
    expect(tx.unknownWord.createManyAndReturn).toHaveBeenCalled();

    tx.unknownWord.update.mockResolvedValue({});
    await repo.markAsLearning(1, 2, tx);
    expect(tx.unknownWord.update).toHaveBeenCalled();

    tx.unknownWord.findMany.mockResolvedValue([]);
    await repo.getUnknownWords(1, tx);
    expect(tx.unknownWord.findMany).toHaveBeenCalled();

    await repo.updateTimesSeenAndConnectStory(1, 1, 1, tx);
    expect(tx.unknownWord.update).toHaveBeenCalled();
  });
});
