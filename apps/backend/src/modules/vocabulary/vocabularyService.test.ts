import { UserVocabulary } from "@prisma/client";
import { VocabularyRepository } from "./vocabularyRepository";
import { VocabularyService } from "./vocabularyService";
import { BadRequestError } from "@/errors/BadRequestError";
import { NotFoundError } from "@/errors/NotFoundError";

const wordsMock: UserVocabulary[] = [
  {
    id: 1,
    word: "Hund",
    translation: "Dog",
    article: "Der",
    userId: 1,
  },
  {
    id: 2,
    word: "Katze",
    translation: "Cat",
    article: "Die",
    userId: 1,
  },
  {
    id: 3,
    word: "Maus",
    translation: "Mouse",
    article: "Die",
    userId: 1,
  },
  {
    id: 4,
    word: "laufen",
    translation: "Run",
    article: null,
    userId: 1,
  },
  {
    id: 5,
    word: "schlafen",
    translation: "Sleep",
    article: null,
    userId: 1,
  },
];

describe("VocabularyService", () => {
  const vocabularyRepositoryMock = {
    getAllWordsWithoutPagination: jest.fn().mockResolvedValue(wordsMock),
    getAllWords: jest
      .fn()
      .mockImplementation((userId: number, skip: number, take: number) => {
        if (skip > wordsMock.length) return Promise.resolve([[], 5]);
        return Promise.resolve([wordsMock.slice(skip, skip + take), 5]);
      }),
  } as unknown as VocabularyRepository;

  it("getWords() returns all words without pagination", async () => {
    const expectedResult = { data: wordsMock };

    const vocabularyService = new VocabularyService(vocabularyRepositoryMock);

    const result = await vocabularyService.getWords(1);
    expect(result).toEqual(expectedResult);
  });

  it("getWords() returns words with pagination", async () => {
    const expectedResult = {
      data: wordsMock.slice(2, 4),
      pagination: {
        currentPage: 2,
        pageSize: 2,
        totalItems: 5,
        totalPages: 3,
      },
    };

    const vocabularyService = new VocabularyService(vocabularyRepositoryMock);

    const result = await vocabularyService.getWords(1, 2, 2);
    expect(result).toEqual(expectedResult);
  });

  it("getWords() returns words with pagination when currentPage = totalPages", async () => {
    const expectedResult = {
      data: wordsMock.slice(4, 6),
      pagination: {
        currentPage: 3,
        pageSize: 2,
        totalItems: 5,
        totalPages: 3,
      },
    };

    const vocabularyService = new VocabularyService(vocabularyRepositoryMock);

    const result = await vocabularyService.getWords(1, 3, 2);
    expect(result).toEqual(expectedResult);
  });

  it("getWords() returns empty array when page is out of bounds", async () => {
    const expectedResult = {
      data: [],
      pagination: {
        currentPage: 25,
        pageSize: 2,
        totalItems: 5,
        totalPages: 3,
      },
    };

    const vocabularyService = new VocabularyService(vocabularyRepositoryMock);

    const result = await vocabularyService.getWords(1, 25, 2);
    expect(result).toEqual(expectedResult);
  });
});

describe("VocabularyService extended", () => {
  it("saveManyWords attaches userId and saves (positive)", async () => {
    const repo: any = {
      saveManyWords: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
    } as unknown as VocabularyRepository;
    const svc = new VocabularyService(repo);

    const input = [
      { word: "Hund", translation: "Dog", article: "der" },
      { word: "Katze", translation: "Cat", article: "die" },
    ];

    const res = await svc.saveManyWords(input as any, 123);

    expect(repo.saveManyWords).toHaveBeenCalledWith([
      { word: "Hund", translation: "Dog", article: "der", userId: 123 },
      { word: "Katze", translation: "Cat", article: "die", userId: 123 },
    ]);
    expect(res).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("saveManyWords throws BadRequestError when input is not array (negative)", async () => {
    const repo: any = {
      saveManyWords: jest.fn(),
    } as unknown as VocabularyRepository;
    const svc = new VocabularyService(repo);

    await expect(svc.saveManyWords({} as any, 1)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it("saveManyWords throws BadRequestError when any item missing fields (negative)", async () => {
    const repo: any = {
      saveManyWords: jest.fn(),
    } as unknown as VocabularyRepository;
    const svc = new VocabularyService(repo);

    await expect(
      svc.saveManyWords([{ word: "Hund" } as any], 1),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("getWordByID returns word if belongs to user (positive)", async () => {
    const repo: any = {
      getWordByID: jest
        .fn()
        .mockResolvedValue({ id: 5, userId: 22 } as UserVocabulary),
    } as unknown as VocabularyRepository;
    const svc = new VocabularyService(repo);

    const res = await svc.getWordByID(5, 22);
    expect(res).toEqual({ id: 5, userId: 22 });
  });

  it("getWordByID throws NotFoundError if not belongs (negative)", async () => {
    const repo: any = {
      getWordByID: jest
        .fn()
        .mockResolvedValue({ id: 5, userId: 99 } as UserVocabulary),
    } as unknown as VocabularyRepository;
    const svc = new VocabularyService(repo);

    await expect(svc.getWordByID(5, 22)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("updateWord updates when word belongs to user (positive)", async () => {
    const repo: any = {
      getWordByID: jest
        .fn()
        .mockResolvedValue({ id: 7, userId: 1 } as UserVocabulary),
      updateWord: jest.fn().mockResolvedValue({ id: 7, translation: "New" }),
    } as unknown as VocabularyRepository;
    const svc = new VocabularyService(repo);

    const res = await svc.updateWord(7, 1, { translation: "New" } as any);
    expect(repo.updateWord).toHaveBeenCalledWith(7, { translation: "New" });
    expect(res).toEqual({ id: 7, translation: "New" });
  });

  it("updateWord throws NotFoundError when word not belongs (negative)", async () => {
    const repo: any = {
      getWordByID: jest
        .fn()
        .mockResolvedValue({ id: 7, userId: 2 } as UserVocabulary),
      updateWord: jest.fn(),
    } as unknown as VocabularyRepository;
    const svc = new VocabularyService(repo);

    await expect(
      svc.updateWord(7, 1, { translation: "New" } as any),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.updateWord).not.toHaveBeenCalled();
  });

  it("deleteWord proxies to repository (positive)", async () => {
    const repo: any = {
      deleteWord: jest.fn().mockResolvedValue({ id: 3 }),
    } as unknown as VocabularyRepository;
    const svc = new VocabularyService(repo);

    const res = await svc.deleteWord(3, 10);
    expect(repo.deleteWord).toHaveBeenCalledWith(3, 10);
    expect(res).toEqual({ id: 3 });
  });

  it("getWordsWithoutPagination proxies to repository (positive)", async () => {
    const repo: any = {
      getAllWordsWithoutPagination: jest.fn().mockResolvedValue([{ id: 1 }]),
    } as unknown as VocabularyRepository;
    const svc = new VocabularyService(repo);
    const res = await svc.getWordsWithoutPagination(123);
    expect(repo.getAllWordsWithoutPagination).toHaveBeenCalledWith(123);
    expect(res).toEqual([{ id: 1 }]);
  });

  it("getWordsCount proxies to repository (positive)", async () => {
    const repo: any = {
      getWordsCount: jest.fn().mockResolvedValue(42),
    } as unknown as VocabularyRepository;
    const svc = new VocabularyService(repo);
    const res = await svc.getWordsCount(7);
    expect(repo.getWordsCount).toHaveBeenCalledWith(7);
    expect(res).toBe(42);
  });
});
