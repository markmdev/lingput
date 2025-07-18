import dotenv from "dotenv";
dotenv.config();
import { redisConnection } from "@/services/redis/redisConnection";
import { Job, Worker } from "bullmq";
import { logger } from "@/utils/logger";
import { UnknownWordRepository } from "./unknownWordRepository";
import { prisma } from "@/services/prisma";
import { RedisStoryCache } from "@/cache/redisStoryCache";
import redisClient from "@/services/redis/redisClient";

const unknownWordRepository = new UnknownWordRepository(prisma);
const redisStoryCache = new RedisStoryCache(redisClient);

async function processor(job: Job) {
  logger.info(`Processing job ${job.id}`);
  const {
    wordId,
    userId,
    wordStatus,
  }: {
    wordId: number;
    userId: number;
    wordStatus: "learned" | "learning";
  } = job.data;

  try {
    if (wordStatus === "learned") {
      await unknownWordRepository.markAsLearned(wordId, userId);
    } else {
      await unknownWordRepository.markAsLearning(wordId, userId);
    }
    await redisStoryCache.invalidateStoryCache(userId);
    logger.info(`Finished processing job ${job.id}`);
    return { success: true };
  } catch (error) {
    logger.error(`Error processing job ${job.id}:`, error);
    throw error;
  }
}

const worker = new Worker("wordStatuses", processor, { connection: redisConnection });

worker.on("completed", (job) => {
  logger.info(`${job.id} has completed! ${job.returnvalue}`);
});

worker.on("failed", (job, err) => {
  logger.error(`${job?.id} has failed with ${err.message}`);
});

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});
