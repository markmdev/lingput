import { PrismaError } from "@/errors/PrismaError";
import { CreateUnknownWordDTO } from "./unknownWord.types";
import { Prisma, PrismaClient, UnknownWord } from "@prisma/client";

export class UnknownWordRepository {
  constructor(private prisma: PrismaClient) {}

  private getClient(
    tx?: Prisma.TransactionClient,
  ): Prisma.TransactionClient | PrismaClient {
    return tx ? tx : this.prisma;
  }

  async saveUnknownWords(
    unknownWords: CreateUnknownWordDTO[],
    tx?: Prisma.TransactionClient,
  ): Promise<UnknownWord[]> {
    const client = this.getClient(tx);
    try {
      const response = await client.unknownWord.createManyAndReturn({
        data: unknownWords,
      });
      return response;
    } catch (error) {
      throw new PrismaError("Unable to save unknown words", error, {
        unknownWords,
      });
    }
  }

  async markAsLearned(
    wordId: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const client = this.getClient(tx);
    try {
      const response = await client.unknownWord.update({
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
      throw new PrismaError("Unable to mark word as 'learned'", error, {
        wordId,
      });
    }
  }

  async markAsLearning(
    wordId: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const client = this.getClient(tx);
    try {
      const response = await client.unknownWord.update({
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
      throw new PrismaError("Unable to mark word as learning", error, {
        wordId,
      });
    }
  }

  async getUnknownWords(
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<UnknownWord[]> {
    const client = this.getClient(tx);
    try {
      const response = await client.unknownWord.findMany({ where: { userId } });
      return response;
    } catch (error) {
      throw new PrismaError("Unable to get unknown words", error, { userId });
    }
  }

  async updateTimesSeenAndConnectStory(
    wordId: number,
    timesSeen: number,
    storyId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<UnknownWord> {
    const client = this.getClient(tx);
    try {
      const response = await client.unknownWord.update({
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
      throw new PrismaError(
        "Unable to update times seen and connect story",
        error,
        {
          wordId,
          timesSeen,
          storyId,
        },
      );
    }
  }
}
