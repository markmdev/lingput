import { PrismaError } from "@/errors/PrismaError";
import { PrismaClient, WordRanking } from "@prisma/client";

export class VocabAssessmentRepository {
  constructor(private prisma: PrismaClient) {}

  async getWords(
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<WordRanking[]> {
    try {
      const response = await this.prisma.wordRanking.findMany({
        where: {
          target_language: targetLanguage,
          source_language: sourceLanguage,
        },
        orderBy: {
          frequencyRank: "asc",
        },
      });
      return response;
    } catch (error) {
      throw new PrismaError("Unable to retrieve word ranking", error, {
        sourceLanguage,
        targetLanguage,
      });
    }
  }
}
