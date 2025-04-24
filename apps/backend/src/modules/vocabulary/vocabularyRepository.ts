import { PrismaClient, UserVocabulary } from "@prisma/client";
import { UserVocabularyWithUserIdDTO } from "./vocabulary.types";
import { PrismaError } from "@/errors/PrismaError";

export class VocabularyRepository {
  constructor(private prisma: PrismaClient) {}
  async saveWord(word: UserVocabularyWithUserIdDTO): Promise<UserVocabulary> {
    try {
      const newWord = await this.prisma.userVocabulary.create({
        data: word,
      });

      return newWord;
    } catch (error) {
      throw new PrismaError("Can't save word to db", error, { word });
    }
  }

  async saveManyWords(words: UserVocabularyWithUserIdDTO[]): Promise<UserVocabulary[]> {
    try {
      const newWords = await this.prisma.userVocabulary.createManyAndReturn({
        data: words,
      });

      return newWords;
    } catch (error) {
      throw new PrismaError("Can't save many words to db", error, { words });
    }
  }

  async getWordByID(wordId: number): Promise<UserVocabulary | null> {
    try {
      return this.prisma.userVocabulary.findUnique({
        where: {
          id: wordId,
        },
      });
    } catch (error) {
      throw new PrismaError("Can't get word by id from db", error, { wordId });
    }
  }

  async getAllWords(userId: number, skip: number, take: number): Promise<[UserVocabulary[], number]> {
    try {
      const whereClause = { userId };
      const [words, totalItems] = await Promise.all([
        this.prisma.userVocabulary.findMany({
          where: whereClause,
          skip,
          take,
        }),
        this.prisma.userVocabulary.count({ where: whereClause }),
      ]);
      return [words, totalItems];
    } catch (error) {
      throw new PrismaError("Can't get all words from db", error, { userId, skip, take });
    }
  }

  async getAllWordsWithoutPagination(userId: number): Promise<UserVocabulary[]> {
    try {
      return this.prisma.userVocabulary.findMany({
        where: { userId },
      });
    } catch (error) {
      throw new PrismaError("Can't get all words from db", error, { userId });
    }
  }

  async deleteWord(wordId: number, userId: number): Promise<UserVocabulary> {
    try {
      return this.prisma.userVocabulary.delete({
        where: {
          id: wordId,
          userId,
        },
      });
    } catch (error) {
      throw new PrismaError("Can't delete word from db", error, { wordId, userId });
    }
  }

  async updateWord(wordId: number, wordData: Partial<UserVocabulary>): Promise<UserVocabulary> {
    try {
      return this.prisma.userVocabulary.update({
        where: {
          id: wordId,
        },
        data: wordData,
      });
    } catch (error) {
      throw new PrismaError("Can't update the word from db", error, { wordId, wordData });
    }
  }
}
