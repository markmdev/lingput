import { PrismaError } from "@/errors/PrismaError";
import { CreateUnknownWordDTO } from "./unknownWord.types";
import { PrismaClient, UnknownWord } from "@prisma/client";

const prisma = new PrismaClient();

export class UnknownWordRepository {
  async saveUnknownWords(unknownWords: CreateUnknownWordDTO[]): Promise<UnknownWord[]> {
    try {
      const response = await prisma.unknownWord.createManyAndReturn({
        data: unknownWords,
      });
      return response;
    } catch (error) {
      throw new PrismaError("Can't save unknown words", { unknownWords }, error);
    }
  }

  async markAsLearned(wordId: number) {
    try {
      const response = await prisma.unknownWord.update({
        where: {
          id: wordId,
        },
        data: {
          status: "learned",
        },
      });
      return response;
    } catch (error) {
      throw new PrismaError("Can't mark word as learned", { wordId }, error);
    }
  }

  async markAsLearning(wordId: number) {
    try {
      const response = await prisma.unknownWord.update({
        where: {
          id: wordId,
        },
        data: {
          status: "learning",
        },
      });
      return response;
    } catch (error) {
      throw new PrismaError("Can't mark word as learning", { wordId }, error);
    }
  }

  async getUnknownWords(): Promise<UnknownWord[]> {
    try {
      const response = await prisma.unknownWord.findMany();
      return response;
    } catch (error) {
      throw new PrismaError("Can't get unknown words", {}, error);
    }
  }

  async updateTimesSeenAndConnectStory(wordId: number, timesSeen: number, storyId: number): Promise<UnknownWord> {
    try {
      const response = await prisma.unknownWord.update({
        where: {
          id: wordId,
        },
        data: {
          timesSeen,
          stories: {
            connect: { id: storyId },
          },
        },
      });

      return response;
    } catch (error) {
      throw new PrismaError("Can't update times seen and connect story", { wordId, timesSeen, storyId }, error);
    }
  }
}
