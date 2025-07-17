import { BaseRedisCache } from "@/services/redis/baseRedisCache";
import { AppRedisClient } from "@/services/redis/redisClient";
import { logger } from "@/utils/logger";
import { WordRanking } from "@prisma/client";

export class RedisWordsCache extends BaseRedisCache {
  protected ttl = 86400;
  protected prefix = "words";

  constructor(redis: AppRedisClient) {
    super(redis);
  }

  async getWords(sourceLanguage: string, targetLanguage: string): Promise<WordRanking[] | null> {
    const cacheKey = this.getKey(sourceLanguage, targetLanguage);
    const cachedWords = await this.get<WordRanking[]>(cacheKey);
    if (cachedWords) {
      logger.info("Cache hit for word ranking");
    } else {
      logger.info("Cache miss for word ranking");
    }
    return cachedWords;
  }

  async saveWords(
    sourceLanguage: string,
    targetLanguage: string,
    words: WordRanking[]
  ): Promise<void> {
    const cacheKey = this.getKey(sourceLanguage, targetLanguage);
    await this.set(cacheKey, words);
    logger.info("Words set in Redis");
  }
}
