import { redisConnection } from "@/services/redis/redisConnection";
import { Queue } from "bullmq";

export const mainQueue = new Queue("mainQueue", { connection: redisConnection });
