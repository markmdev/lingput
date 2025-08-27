import IORedis from "ioredis";

if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
  throw new Error(
    "REDIS_HOST and REDIS_PORT environment variables are required",
  );
}

const redisHost = process.env.REDIS_HOST;
const redisPort = parseInt(process.env.REDIS_PORT);

export const redisConnection = new IORedis(redisPort, redisHost, {
  maxRetriesPerRequest: null,
});

export const closeIORedisConnection = async () => {
  await redisConnection.quit();
};
