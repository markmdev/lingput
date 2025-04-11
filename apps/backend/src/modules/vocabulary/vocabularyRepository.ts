import { UserVocabulary } from "@prisma/client";
import { UserVocabularyDTO } from "./vocabulary.types";
import { prisma } from "@/services/prisma";
import { PrismaError } from "@/errors/PrismaError";

export class VocabularyRepository {
  async saveWordToDB(word: UserVocabularyDTO): Promise<UserVocabulary> {
    try {
      const newWord = await prisma.userVocabulary.create({
        data: word,
      });

      return newWord;
    } catch (error) {
      throw new PrismaError("Can't save word to db", { word }, error);
    }
  }

  async saveManyWordsToDB(words: UserVocabularyDTO[]): Promise<UserVocabulary[]> {
    try {
      const newWords = await prisma.userVocabulary.createManyAndReturn({
        data: words,
      });

      return newWords;
    } catch (error) {
      throw new PrismaError("Can't save many words to db", { words }, error);
    }
  }

  async getAllWordsFromDB(): Promise<UserVocabulary[]> {
    try {
      return prisma.userVocabulary.findMany();
    } catch (error) {
      throw new PrismaError("Can't get all words from db", {}, error);
    }
  }

  async deleteWord(wordId: number): Promise<UserVocabulary> {
    try {
      return prisma.userVocabulary.delete({
        where: {
          id: wordId,
        },
      });
    } catch (error) {
      throw new PrismaError("Can't delete word from db", { wordId }, error);
    }
  }
}
