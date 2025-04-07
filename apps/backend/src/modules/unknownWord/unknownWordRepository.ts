import { CreateUnknownWordWithStoryIdDTO } from "./unknownWord.types";
import { PrismaClient, UnknownWord } from "@prisma/client";

const prisma = new PrismaClient();

export class UnknownWordRepository {
  async saveUnknownWords(unknownWords: CreateUnknownWordWithStoryIdDTO[]): Promise<UnknownWord[]> {
    const response = await prisma.unknownWord.createManyAndReturn({
      data: unknownWords,
    });
    return response;
  }

  async markAsLearned(wordId: number) {
    const response = await prisma.unknownWord.update({
      where: {
        id: wordId,
      },
      data: {
        status: "learned",
      },
    });
    return response;
  }

  async markAsLearning(wordId: number) {
    const response = await prisma.unknownWord.update({
      where: {
        id: wordId,
      },
      data: {
        status: "learning",
      },
    });
    return response;
  }

  async getUnknownWords(): Promise<UnknownWord[]> {
    const response = await prisma.unknownWord.findMany();
    return response;
  }

  async updateTimesSeen(wordId: number, timesSeen: number): Promise<UnknownWord> {
    const response = await prisma.unknownWord.update({
      where: {
        id: wordId,
      },
      data: {
        timesSeen,
      },
    });

    return response;
  }
}
