import { redisConnection } from "@/services/redis/redisConnection";
import { Queue } from "bullmq";

export const mainQueue = new Queue("mainQueue", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: { age: 60 * 60 * 24, count: 1000 },
    removeOnFail: { age: 60 * 60 * 24 * 7 },
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  },
});
