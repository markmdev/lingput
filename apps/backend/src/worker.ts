import { config } from "dotenv";
config();
import { storyModule, unknownWordModule } from "./container";
import { BullWorker, JobHandler } from "./modules/jobs/bullWorker";
import { closeIORedisConnection, redisConnection } from "./services/redis/redisConnection";
import { prisma } from "./services/prisma";
import { Job } from "bullmq";
import { closeRedisConnection, connectRedis } from "./services/redis/redisClient";
import { GENERATION_PHASES } from "./modules/story/generationPhases";

let bullWorker: BullWorker;

const startWorker = async () => {
  await connectRedis();

  const handlers = new Map<string, JobHandler>();

  handlers.set(
    "updateWordStatus",
    unknownWordModule.service.processUpdateWordStatus.bind(unknownWordModule.service)
  );
  handlers.set("generateStory", (job: Job) => {
    job.updateProgress({
      phase: GENERATION_PHASES["starting"],
      totalSteps: Object.keys(GENERATION_PHASES).length,
    });
    return storyModule.service.processStoryGenerationJob(job, prisma);
  });

  bullWorker = new BullWorker("mainQueue", redisConnection, handlers);

  console.log("BullMQ worker started...");
};

const shutdown = async () => {
  await bullWorker.worker.close();
  await closeRedisConnection();
  await closeIORedisConnection();
  process.exit(0);
};

["SIGINT", "SIGTERM"].forEach((sig) => process.once(sig, shutdown));

startWorker();
