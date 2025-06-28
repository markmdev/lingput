import { RedisError } from "@/errors/RedisError";
import { AppRedisClient } from "@/services/redis";
import { logger } from "@/utils/logger";
import { WordRanking } from "@prisma/client";

const CACHE_TTL = 86400;
const CACHE_KEY_PREFIX = "stories";

export class RedisWordsCache {
  constructor(private redis: AppRedisClient) {}

  private getCacheKey(sourceLanguage: string, targetLanguage: string): string {
    return `words:${sourceLanguage}:${targetLanguage}`;
  }

  async getWordsFromCache(sourceLanguage: string, targetLanguage: string) {
    const cacheKey = this.getCacheKey(sourceLanguage, targetLanguage);
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
  }

  async saveWordsToCache(sourceLanguage: string, targetLanguage: string, words: WordRanking[]) {
    const cacheKey = this.getCacheKey(sourceLanguage, targetLanguage);
    try {
      await this.redis.set(cacheKey, JSON.stringify(words), {
        expiration: { type: "EX", value: 86400 },
      });
      logger.info("Words set in Redis");
    } catch (error) {
      throw new RedisError("Unable to set words in Redis", error);
    }
  }
}
