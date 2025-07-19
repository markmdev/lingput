import { redisConnection } from "@/services/redis/redisConnection";
import { Queue } from "bullmq";

export const queues = {
  mainQueue: new Queue("mainQueue", { connection: redisConnection }),
};

export type QueueNames = keyof typeof queues;

export function getQueueByName(name: QueueNames): Queue {
  const queue = queues[name];
  if (!queue) {
    throw new Error("Queue not found");
  }
  return queue;
}
