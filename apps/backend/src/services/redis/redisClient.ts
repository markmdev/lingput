import { RedisError } from "@/errors/RedisError";
import { createClient } from "redis";
import { logger } from "../../utils/logger";
import { log } from "console";

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
    logger.info("Connected to Redis");
  } catch (error) {
    logger.error("Failed to connect to Redis", error);
    throw new RedisError("Failed to connect to Redis", error);
  }
};

const closeRedisConnection = async () => {
  try {
    await redisClient.quit();
    logger.info("Closed Redis connection");
  } catch (error) {
    logger.error("Failed to close redisClient", error);
    throw new RedisError("Failed to close redisClient", error);
  }
};

export type AppRedisClient = typeof redisClient;

export { connectRedis, closeRedisConnection, redisClient };
