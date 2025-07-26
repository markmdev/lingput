import { RedisError } from "@/errors/RedisError";
import { createClient } from "redis";
import { logger } from "../../utils/logger";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL environment variable is required");
}

const redisClient = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on("error", (err) => {
  logger.error("Redis client error", err);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error("Failed to connect to Redis", { error });
    throw new RedisError("Failed to connect to Redis", error);
  }
};

export type AppRedisClient = typeof redisClient;

export { connectRedis, redisClient };
