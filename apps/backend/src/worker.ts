import { config } from "dotenv";
config();
import { storyModule, unknownWordModule } from "./container";
import { BullWorker, JobHandler } from "./modules/jobs/bullWorker";
import { redisConnection } from "./services/redis/redisConnection";

const handlers = new Map<string, JobHandler>();

handlers.set(
  "updateWordStatus",
  unknownWordModule.service.processUpdateWordStatus.bind(unknownWordModule.service)
);
handlers.set(
  "generateStory",
  storyModule.service.processStoryGenerationJob.bind(storyModule.service)
);

const bullWorker = new BullWorker("mainQueue", redisConnection, handlers);

console.log("BullMQ worker started...");
