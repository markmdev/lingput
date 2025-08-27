import { BaseRedisCache } from "@/services/redis/baseRedisCache";
import { AppRedisClient } from "@/services/redis/redisClient";

export class RedisStoryLimits extends BaseRedisCache {
  protected ttl = 86400;
  protected prefix = "stories:limits";

  constructor(
    redis: AppRedisClient,
    private limit = 5,
  ) {
    super(redis);
  }

  async decrementCount(userId: number) {
    const key = this.getKey(userId);
    const exists = await this.redis.exists(key);
    if (!exists) return;
    await this.redis.decr(key);
  }

  async incrementCount(userId: number) {
    const key = this.getKey(userId);
    const exists = await this.redis.exists(key);
    await this.redis.incr(key);
    if (!exists) {
      const now = new Date();
      const laNow = new Date(
        now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
      );
      const laMidnight = new Date(laNow);
      laMidnight.setHours(24, 0, 0, 0);
      const secondsToMidnight = Math.floor(
        (laMidnight.getTime() - laNow.getTime()) / 1000,
      );
      await this.redis.expire(key, secondsToMidnight);
    }
  }

  async isLimitReached(userId: number) {
    const key = this.getKey(userId);
    const count = await this.redis.get(key);
    return Number(count) >= this.limit;
  }
}
