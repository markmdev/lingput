import { logger } from "@/utils/logger";
import { AppRedisClient } from "./redisClient";
import { RedisError } from "@/errors/RedisError";

export abstract class BaseRedisCache {
  protected abstract ttl: number;
  protected abstract prefix: string;

  constructor(protected redis: AppRedisClient) {}

  getKey(...args: (string | number)[]): string {
    return [this.prefix, ...args].join(":");
  }

  async delKey(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      throw new RedisError("Failed to delete key from Redis", error, { key });
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error("[cache] getKey error", error, key);
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set(key: string, value: object | any[]): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), {
        expiration: { type: "EX", value: this.ttl },
      });
    } catch (error) {
      throw new RedisError("Failed to set value for a key", error, {
        key,
        value,
      });
    }
  }

  async lRange(key: string): Promise<string[]> {
    try {
      const value = await this.redis.lRange(key, 0, -1);
      return value;
    } catch (error) {
      logger.error("[cache] lRange error", error, key);
      return [];
    }
  }

  async setList(key: string, values: string[]): Promise<void> {
    try {
      await this.redis
        .multi()
        .del(key)
        .rPush(key, values)
        .expire(key, this.ttl)
        .exec();
    } catch (error) {
      throw new RedisError("Failed to set list in Redis", error, {
        key,
        values,
      });
    }
  }
}
