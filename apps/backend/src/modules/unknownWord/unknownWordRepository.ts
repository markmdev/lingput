import { PrismaError } from "@/errors/PrismaError";
import { CreateUnknownWordDTO } from "./unknownWord.types";
import { PrismaClient, UnknownWord } from "@prisma/client";

export class UnknownWordRepository {
  constructor(private prisma: PrismaClient) {}
  async saveUnknownWords(unknownWords: CreateUnknownWordDTO[]): Promise<UnknownWord[]> {
    try {
      const response = await this.prisma.unknownWord.createManyAndReturn({
        data: unknownWords,
      });
      return response;
    } catch (error) {
      throw new PrismaError("Can't save unknown words", { unknownWords }, error);
    }
  }

  async markAsLearned(wordId: number, userId: number) {
    try {
      const response = await this.prisma.unknownWord.update({
        where: {
          id: wordId,
          userId,
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

  async markAsLearning(wordId: number, userId: number) {
    try {
      const response = await this.prisma.unknownWord.update({
        where: {
          id: wordId,
          userId,
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

  async getUnknownWords(userId: number): Promise<UnknownWord[]> {
    try {
      const response = await this.prisma.unknownWord.findMany({ where: { userId } });
      return response;
    } catch (error) {
      throw new PrismaError("Can't get unknown words", {}, error);
    }
  }

  async updateTimesSeenAndConnectStory(wordId: number, timesSeen: number, storyId: number): Promise<UnknownWord> {
    try {
      const response = await this.prisma.unknownWord.update({
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
