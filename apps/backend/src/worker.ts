import { config } from "dotenv";
config();
import { storyModule, unknownWordModule } from "./container";
import { BullWorker, JobHandler } from "./modules/jobs/bullWorker";
import { redisConnection } from "./services/redis/redisConnection";
import { prisma } from "./services/prisma";
import { Job } from "bullmq";
import { connectRedis } from "./services/redis/redisClient";

const startWorker = async () => {
  await connectRedis();

  const handlers = new Map<string, JobHandler>();

  handlers.set(
    "updateWordStatus",
    unknownWordModule.service.processUpdateWordStatus.bind(unknownWordModule.service)
  );
  handlers.set("generateStory", (job: Job) =>
    storyModule.service.processStoryGenerationJob(job, prisma)
  );

  const bullWorker = new BullWorker("mainQueue", redisConnection, handlers);

  console.log("BullMQ worker started...");
};

startWorker();
