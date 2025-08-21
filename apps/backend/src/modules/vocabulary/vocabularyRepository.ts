import { PrismaClient, UserVocabulary } from "@prisma/client";
import { UserVocabularyWithUserIdDTO } from "./vocabulary.types";
import { PrismaError } from "@/errors/PrismaError";

export class VocabularyRepository {
  constructor(private prisma: PrismaClient) {}

  async getWordsCount(userId: number): Promise<number> {
    try {
      const count = await this.prisma.userVocabulary.count({ where: { userId } });
      return count;
    } catch (error) {
      throw new PrismaError("Unable to get words count", error, { userId });
    }
  }

  async saveWord(word: UserVocabularyWithUserIdDTO): Promise<UserVocabulary> {
    try {
      const newWord = await this.prisma.userVocabulary.create({
        data: word,
      });

      return newWord;
    } catch (error) {
      throw new PrismaError("Unable to save word to DB", error, { word });
    }
  }

  async saveManyWords(words: UserVocabularyWithUserIdDTO[]): Promise<UserVocabulary[]> {
    try {
      const newWords = await this.prisma.userVocabulary.createManyAndReturn({
        data: words,
      });

      return newWords;
    } catch (error) {
      throw new PrismaError("Unable to save many words to DB", error, { words });
    }
  }

  async getWordByID(wordId: number): Promise<UserVocabulary | null> {
    try {
      const word = await this.prisma.userVocabulary.findUnique({
        where: {
          id: wordId,
        },
      });
      return word;
    } catch (error) {
      throw new PrismaError("Unable to retrieve word by ID from DB", error, { wordId });
    }
  }

  async getAllWords(
    userId: number,
    skip: number,
    take: number
  ): Promise<[UserVocabulary[], number]> {
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
      throw new PrismaError("Unable to get all words from DB", error, { userId, skip, take });
    }
  }

  async getAllWordsWithoutPagination(userId: number): Promise<UserVocabulary[]> {
    try {
      return this.prisma.userVocabulary.findMany({
        where: { userId },
      });
    } catch (error) {
      throw new PrismaError("Unable to get all words from DB", error, { userId });
    }
  }

  async deleteWord(wordId: number, userId: number): Promise<UserVocabulary> {
    try {
      const deleted = await this.prisma.userVocabulary.delete({
        where: {
          id: wordId,
          userId,
        },
      });
      return deleted;
    } catch (error) {
      throw new PrismaError("Unable to delete word from DB", error, { wordId, userId });
    }
  }

  async updateWord(wordId: number, wordData: Partial<UserVocabulary>): Promise<UserVocabulary> {
    try {
      const updated = await this.prisma.userVocabulary.update({
        where: {
          id: wordId,
        },
        data: wordData,
      });
      return updated;
    } catch (error) {
      throw new PrismaError("Unable to update the word from DB", error, { wordId, wordData });
    }
  }
}
