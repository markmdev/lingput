import { RedisError } from "@/errors/RedisError";
import { createClient } from "redis";
import { logger } from "../../utils/logger";

if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
  throw new Error("REDIS_HOST and REDIS_PORT environment variables are required");
}

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

const redisClient = createClient({
  url: `redis://${redisHost}:${redisPort}`,
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
