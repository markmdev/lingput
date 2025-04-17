import { UserVocabulary } from "@prisma/client";
import { VocabularyRepository } from "./vocabularyRepository";
import { VocabularyService } from "./vocabularyService";

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
    getAllWords: jest.fn().mockImplementation((userId: number, skip: number, take: number) => {
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
