import { redisConnection } from "@/services/redisConnection";
import { Queue } from "bullmq";

export const queues = {
  wordStatuses: new Queue("wordStatuses", { connection: redisConnection }),
};

export type QueueNames = keyof typeof queues;

export function getQueueByName(name: QueueNames): Queue {
  const queue = queues[name];
  if (!queue) {
    throw new Error("Queue not found");
  }
  return queue;
}
