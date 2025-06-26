import { PrismaError } from "@/errors/PrismaError";
import { RedisError } from "@/errors/RedisError";
import { logger } from "@/utils/logger";
import { PrismaClient, WordRanking } from "@prisma/client";
import { AppRedisClient } from "@/services/redis";

export class VocabAssessmentRepository {
  constructor(private prisma: PrismaClient, private redis: AppRedisClient) {}

  async getWords(sourceLanguage: string, targetLanguage: string) {
    const cacheKey = `words:${sourceLanguage}:${targetLanguage}`;
    try {
      const cachedWords = await this.redis.get(cacheKey);
      if (cachedWords) {
        logger.info("Cache hit for word ranking");
        const result = JSON.parse(cachedWords) as WordRanking[];
        return result;
      }
    } catch (error) {
      logger.error("Unable to retrieve cached words from Redis", error);
    }
    logger.info("Cache miss for word ranking");

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
      try {
        await this.redis.set(cacheKey, JSON.stringify(response), {
          expiration: { type: "EX", value: 86400 },
        });
        logger.info("Words set in Redis");
      } catch (error) {
        throw new RedisError("Unable to set words in Redis", error);
      }
      return response;
    } catch (error) {
      if (error instanceof RedisError) throw error;

      throw new PrismaError("Unable to retrieve word ranking", error, {
        sourceLanguage,
        targetLanguage,
      });
    }
  }
}
