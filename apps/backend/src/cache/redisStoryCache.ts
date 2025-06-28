import { logger } from "@/utils/logger";
import { AppRedisClient } from "../services/redis";
import { Story, UnknownWord } from "@prisma/client";

export class RedisStoryCache {
  constructor(private redis: AppRedisClient) {}

  private parseRedisStory(storyString: string): Story & { unknownWords: UnknownWord[] } {
    const storyJson = JSON.parse(storyString);
    return {
      id: Number(storyJson.id),
      storyText: storyJson.storyText,
      translationText: storyJson.translationText,
      audioUrl: storyJson.audioUrl,
      userId: Number(storyJson.userId),
      unknownWords: storyJson.unknownWords || [],
    };
  }

  async invalidateStoryCache(userId: number) {
    const cacheKey = `stories:${userId}`;
    await this.redis.del(cacheKey);
    console.log("Cache cleared");
  }

  async getAllStoriesFromCache(
    userId: number
  ): Promise<(Story & { unknownWords: UnknownWord[] })[]> {
    const cacheKey = `stories:${userId}`;
    try {
      const cachedStories = await this.redis.lRange(cacheKey, 0, -1);
      if (cachedStories.length > 0) {
        logger.info("Cache hit for stories");
        return cachedStories.map((item) => this.parseRedisStory(item));
      }
    } catch (error) {
      logger.warn("Redis cache error", { error, userId });
    }
    return [];
  }

  async saveStoriesToCache(userId: number, stories: Story[]) {
    const cacheKey = `stories:${userId}`;
    try {
      await this.redis
        .multi()
        .del(cacheKey)
        .rPush(
          cacheKey,
          stories.map((item) => JSON.stringify(item))
        )
        .expire(cacheKey, 1800)
        .exec();
    } catch (error) {
      logger.warn("Redis cache error", { error, userId });
    }
  }
}
