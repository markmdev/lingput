import { RedisError } from "@/errors/RedisError";
import { createClient } from "redis";
import { logger } from "../utils/logger";

const redisClient = createClient({
  url: "redis://redis-12118.c60.us-west-1-2.ec2.redns.redis-cloud.com:12118",
  password: "7VaEoqj225MmgVf4llI7KHhEYZFsBkSl",
});

redisClient.on("error", (err) => {
  throw new RedisError("Redis client error", err);
});

redisClient.connect();

export type AppRedisClient = typeof redisClient;

export default redisClient;
