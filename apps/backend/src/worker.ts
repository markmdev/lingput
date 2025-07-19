import { config } from "dotenv";
config();
import { unknownWordModule } from "./container";
import { BullWorker, JobHandler } from "./modules/jobs/bullWorker";
import { redisConnection } from "./services/redis/redisConnection";

const handlers: Map<string, JobHandler> = new Map([
  [
    "updateWordStatus",
    unknownWordModule.service.processUpdateWordStatus.bind(unknownWordModule.service),
  ],
]);
const bullWorker = new BullWorker("mainQueue", redisConnection, handlers);

console.log("BullMQ worker started...");
