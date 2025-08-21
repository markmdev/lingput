import { VocabularyRepository } from "./vocabularyRepository";
import { PrismaError } from "@/errors/PrismaError";

function createPrismaMock(countReturn: number) {
  return {
    userVocabulary: {
      count: jest.fn().mockResolvedValue(countReturn),
    },
  } as any;
}

describe("VocabularyRepository.getWordsCount", () => {
  it("calls prisma.userVocabulary.count with where userId", async () => {
    const prisma = createPrismaMock(5);
    const repo = new VocabularyRepository(prisma);

    const result = await repo.getWordsCount(123);

    expect(result).toBe(5);
    expect(prisma.userVocabulary.count).toHaveBeenCalledWith({ where: { userId: 123 } });
  });
});

describe("VocabularyRepository other methods", () => {
  it("saveWord calls create with data and returns result", async () => {
    const prisma: any = {
      userVocabulary: {
        create: jest.fn().mockResolvedValue({ id: 1, word: "Hund" }),
      },
    };
    const repo = new VocabularyRepository(prisma);

    const input = { word: "Hund", translation: "Dog", article: "der", userId: 1 };
    const res = await repo.saveWord(input as any);
    expect(res).toEqual({ id: 1, word: "Hund" });
    expect(prisma.userVocabulary.create).toHaveBeenCalledWith({ data: input });
  });

  it("saveWord throws PrismaError on failure", async () => {
    const prisma: any = {
      userVocabulary: {
        create: jest.fn().mockRejectedValue(new Error("db")),
      },
    };
    const repo = new VocabularyRepository(prisma);
    const input = { word: "Hund", translation: "Dog", article: "der", userId: 1 } as any;

    await expect(repo.saveWord(input)).rejects.toBeInstanceOf(PrismaError);
  });

  it("saveManyWords calls createManyAndReturn with data and returns result", async () => {
    const created = [
      { id: 1, word: "Hund" },
      { id: 2, word: "Katze" },
    ];
    const prisma: any = {
      userVocabulary: {
        createManyAndReturn: jest.fn().mockResolvedValue(created),
      },
    };
    const repo = new VocabularyRepository(prisma);

    const input = [
      { word: "Hund", translation: "Dog", article: "der", userId: 1 },
      { word: "Katze", translation: "Cat", article: "die", userId: 1 },
    ] as any;
    const res = await repo.saveManyWords(input);
    expect(res).toBe(created);
    expect(prisma.userVocabulary.createManyAndReturn).toHaveBeenCalledWith({ data: input });
  });

  it("saveManyWords throws PrismaError on failure", async () => {
    const prisma: any = {
      userVocabulary: {
        createManyAndReturn: jest.fn().mockRejectedValue(new Error("db")),
      },
    };
    const repo = new VocabularyRepository(prisma);
    await expect(repo.saveManyWords([] as any)).rejects.toBeInstanceOf(PrismaError);
  });

  it("getWordByID calls findUnique with id and returns result", async () => {
    const prisma: any = {
      userVocabulary: {
        findUnique: jest.fn().mockResolvedValue({ id: 7, word: "Hund" }),
      },
    };
    const repo = new VocabularyRepository(prisma);

    const res = await repo.getWordByID(7);
    expect(res).toEqual({ id: 7, word: "Hund" });
    expect(prisma.userVocabulary.findUnique).toHaveBeenCalledWith({ where: { id: 7 } });
  });

  it("getWordByID throws PrismaError on failure", async () => {
    const prisma: any = {
      userVocabulary: {
        findUnique: jest.fn().mockRejectedValue(new Error("db")),
      },
    };
    const repo = new VocabularyRepository(prisma);
    await expect(repo.getWordByID(1)).rejects.toBeInstanceOf(PrismaError);
  });

  it("getAllWords returns [words, total] and queries with where/skip/take", async () => {
    const words = [{ id: 1 }, { id: 2 }];
    const prisma: any = {
      userVocabulary: {
        findMany: jest.fn().mockResolvedValue(words),
        count: jest.fn().mockResolvedValue(10),
      },
    };
    const repo = new VocabularyRepository(prisma);

    const res = await repo.getAllWords(5, 10, 20);
    expect(res).toEqual([words, 10]);
    expect(prisma.userVocabulary.findMany).toHaveBeenCalledWith({
      where: { userId: 5 },
      skip: 10,
      take: 20,
    });
    expect(prisma.userVocabulary.count).toHaveBeenCalledWith({ where: { userId: 5 } });
  });

  it("getAllWords throws PrismaError on failure", async () => {
    const prisma: any = {
      userVocabulary: {
        findMany: jest.fn().mockRejectedValue(new Error("db")),
        count: jest.fn(),
      },
    };
    const repo = new VocabularyRepository(prisma);
    await expect(repo.getAllWords(1, 0, 10)).rejects.toBeInstanceOf(PrismaError);
  });

  it("getAllWordsWithoutPagination filters by userId", async () => {
    const prisma: any = {
      userVocabulary: {
        findMany: jest.fn().mockResolvedValue([{ id: 1 }]),
      },
    };
    const repo = new VocabularyRepository(prisma);

    const res = await repo.getAllWordsWithoutPagination(77);
    expect(res).toEqual([{ id: 1 }]);
    expect(prisma.userVocabulary.findMany).toHaveBeenCalledWith({ where: { userId: 77 } });
  });

  it("deleteWord deletes by composite where id+userId", async () => {
    const prisma: any = {
      userVocabulary: {
        delete: jest.fn().mockResolvedValue({ id: 9 }),
      },
    };
    const repo = new VocabularyRepository(prisma);

    const res = await repo.deleteWord(9, 3);
    expect(res).toEqual({ id: 9 });
    expect(prisma.userVocabulary.delete).toHaveBeenCalledWith({ where: { id: 9, userId: 3 } });
  });

  it("deleteWord throws PrismaError on failure", async () => {
    const prisma: any = {
      userVocabulary: {
        delete: jest.fn().mockRejectedValue(new Error("db")),
      },
    };
    const repo = new VocabularyRepository(prisma);
    await expect(repo.deleteWord(1, 1)).rejects.toBeInstanceOf(PrismaError);
  });

  it("updateWord updates by id with partial data", async () => {
    const prisma: any = {
      userVocabulary: {
        update: jest.fn().mockResolvedValue({ id: 4, word: "neu" }),
      },
    };
    const repo = new VocabularyRepository(prisma);

    const res = await repo.updateWord(4, { translation: "New" } as any);
    expect(res).toEqual({ id: 4, word: "neu" });
    expect(prisma.userVocabulary.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: { translation: "New" },
    });
  });

  it("updateWord throws PrismaError on failure", async () => {
    const prisma: any = {
      userVocabulary: {
        update: jest.fn().mockRejectedValue(new Error("db")),
      },
    };
    const repo = new VocabularyRepository(prisma);
    await expect(repo.updateWord(1, {})).rejects.toBeInstanceOf(PrismaError);
  });
});
