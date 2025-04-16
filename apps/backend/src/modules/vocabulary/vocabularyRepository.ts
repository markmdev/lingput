import { UserVocabulary } from "@prisma/client";
import { UserVocabularyWithUserIdDTO } from "./vocabulary.types";
import { prisma } from "@/services/prisma";
import { PrismaError } from "@/errors/PrismaError";

export class VocabularyRepository {
  async saveWord(word: UserVocabularyWithUserIdDTO): Promise<UserVocabulary> {
    try {
      const newWord = await prisma.userVocabulary.create({
        data: word,
      });

      return newWord;
    } catch (error) {
      throw new PrismaError("Can't save word to db", { word }, error);
    }
  }

  async saveManyWords(words: UserVocabularyWithUserIdDTO[]): Promise<UserVocabulary[]> {
    try {
      const newWords = await prisma.userVocabulary.createManyAndReturn({
        data: words,
      });

      return newWords;
    } catch (error) {
      throw new PrismaError("Can't save many words to db", { words }, error);
    }
  }

  async getWordByID(wordId: number): Promise<UserVocabulary | null> {
    try {
      return prisma.userVocabulary.findUnique({
        where: {
          id: wordId,
        },
      });
    } catch (error) {
      throw new PrismaError("Can't get word by id from db", { wordId }, error);
    }
  }

  async getAllWords(userId: number): Promise<UserVocabulary[]> {
    try {
      return prisma.userVocabulary.findMany({
        where: {
          userId,
        },
      });
    } catch (error) {
      throw new PrismaError("Can't get all words from db", {}, error);
    }
  }

  async deleteWord(wordId: number, userId: number): Promise<UserVocabulary> {
    try {
      return prisma.userVocabulary.delete({
        where: {
          id: wordId,
          userId,
        },
      });
    } catch (error) {
      throw new PrismaError("Can't delete word from db", { wordId }, error);
    }
  }

  async updateWord(wordId: number, wordData: Partial<UserVocabulary>): Promise<UserVocabulary> {
    try {
      return prisma.userVocabulary.update({
        where: {
          id: wordId,
        },
        data: wordData,
      });
    } catch (error) {
      throw new PrismaError("Can't update the word from db", { wordId }, error);
    }
  }
}
