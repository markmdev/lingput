import IORedis from "ioredis";

if (!process.env.REDIS_STRING) {
  throw new Error("REDIS_STRING environment variable is required");
}

export const redisConnection = new IORedis(process.env.REDIS_STRING, {
  maxRetriesPerRequest: null,
});
