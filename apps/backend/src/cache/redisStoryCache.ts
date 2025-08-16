import { logger } from "@/utils/logger";
import { Story, UnknownWord } from "@prisma/client";
import { RedisError } from "@/errors/RedisError";
import { BaseRedisCache } from "@/services/redis/baseRedisCache";
import { AppRedisClient } from "@/services/redis/redisClient";

export class RedisStoryCache extends BaseRedisCache {
  protected ttl = 1800;
  protected prefix = "stories";

  constructor(redis: AppRedisClient) {
    super(redis);
  }

  private parseRedisStory(storyString: string): Story & { unknownWords: UnknownWord[] } {
    try {
      const storyJson = JSON.parse(storyString);
      return {
        id: Number(storyJson.id),
        storyText: storyJson.storyText,
        translationText: storyJson.translationText,
        audioUrl: storyJson.audioUrl,
        userId: Number(storyJson.userId),
        unknownWords: storyJson.unknownWords || [],
      };
    } catch (error) {
      logger.error("Failed to parse cached story", { error, storyString });
      throw new RedisError("Invalid cached story format", error, { storyString });
    }
  }

  async invalidateStoryCache(userId: number): Promise<void> {
    const cacheKey = this.getKey(userId);
    await this.delKey(cacheKey);
    logger.info(`[cache] Key ${cacheKey} deleted`);
  }

  async getAllStoriesFromCache(
    userId: number
  ): Promise<(Story & { unknownWords: UnknownWord[] })[]> {
    const cacheKey = this.getKey(userId);
    const cachedStories = await this.lRange(cacheKey);
    if (cachedStories.length > 0) {
      logger.info("Cache hit for stories", { userId, count: cachedStories.length });
    } else {
      logger.info("Cache miss for stories", { userId });
    }
    return cachedStories.map((item) => this.parseRedisStory(item));
  }

  async saveStoriesToCache(
    userId: number,
    stories: (Story & { unknownWords: UnknownWord[] })[]
  ): Promise<void> {
    if (stories.length === 0) {
      logger.info("Stories array is empty. Not saving to cache");
      return;
    }
    const cacheKey = this.getKey(userId);
    await this.setList(
      cacheKey,
      stories.map((item) => JSON.stringify(item))
    );
    logger.info("Stories saved to cache", { userId, count: stories.length });
  }
}
