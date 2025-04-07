import { PrismaClient, UserVocabulary } from "@prisma/client";
import { UserVocabularyDTO } from "./vocabulary.types";

const prisma = new PrismaClient();

export class VocabularyRepository {
  async saveWordToDB(word: UserVocabularyDTO): Promise<UserVocabulary> {
    const newWord = await prisma.userVocabulary.create({
      data: word,
    });

    return newWord;
  }

  async saveManyWordsToDB(words: UserVocabularyDTO[]): Promise<UserVocabulary[]> {
    const newWords = await prisma.userVocabulary.createManyAndReturn({
      data: words,
    });

    return newWords;
  }

  async getAllWordsFromDB(): Promise<UserVocabulary[]> {
    return prisma.userVocabulary.findMany();
  }

  async deleteWord(wordId: number): Promise<UserVocabulary> {
    return prisma.userVocabulary.delete({
      where: {
        id: wordId,
      },
    });
  }
}
