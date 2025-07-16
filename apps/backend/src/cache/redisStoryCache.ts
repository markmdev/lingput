import { logger } from "@/utils/logger";
import { AppRedisClient } from "../services/redis/redisClient";
import { Story, UnknownWord } from "@prisma/client";
import { RedisError } from "@/errors/RedisError";

const CACHE_TTL = 1800;
const CACHE_KEY_PREFIX = "stories";

export class RedisStoryCache {
  constructor(private redis: AppRedisClient) {}

  private getCacheKey(userId: number): string {
    return `${CACHE_KEY_PREFIX}:${userId}`;
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
    const cacheKey = this.getCacheKey(userId);
    try {
      await this.redis.del(cacheKey);
      logger.info("Story cache invalidated", { userId });
    } catch (error) {
      logger.error("Failed to invalidate story cache", { error, userId });
    }
  }

  async getAllStoriesFromCache(
    userId: number
  ): Promise<(Story & { unknownWords: UnknownWord[] })[]> {
    const cacheKey = this.getCacheKey(userId);
    try {
      const cachedStories = await this.redis.lRange(cacheKey, 0, -1);
      if (cachedStories.length > 0) {
        logger.info("Cache hit for stories", { userId, count: cachedStories.length });
        return cachedStories.map((item) => this.parseRedisStory(item));
      }
    } catch (error) {
      logger.warn("Redis cache error", { error, userId });
    }
    return [];
  }

  async saveStoriesToCache(
    userId: number,
    stories: (Story & { unknownWords: UnknownWord[] })[]
  ): Promise<void> {
    const cacheKey = this.getCacheKey(userId);
    try {
      await this.redis
        .multi()
        // Invalidate old story data if exists
        .del(cacheKey)
        // Save a new version of the story
        .rPush(
          cacheKey,
          stories.map((item) => JSON.stringify(item))
        )
        .expire(cacheKey, CACHE_TTL)
        .exec();
      logger.info("Stories saved to cache", { userId, count: stories.length });
    } catch (error) {
      logger.warn("Redis cache error", { error, userId });
    }
  }
}
