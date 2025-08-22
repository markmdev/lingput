import { storyModule } from "@/container";
import { CustomError } from "@/errors/CustomError";
import { logger } from "@/utils/logger";
import { Job, Worker } from "bullmq";
import { ConnectionOptions } from "bullmq";

export type JobHandler = (job: Job) => Promise<any>;

export class BullWorker {
  worker: Worker;

  constructor(
    queueName: string,
    connection: ConnectionOptions,
    private handlers: Map<string, JobHandler>
  ) {
    this.worker = new Worker(queueName, this.processor.bind(this), { connection });

    this.worker.on("completed", (job) => {
      logger.info(`Job ${job.id} has completed! ${job.returnvalue}`);
    });

    this.worker.on("failed", async (job, err) => {
      logger.error(`Job ${job?.id} has failed with ${err.message}`);
      if (!job) return;

      const attemptsAllowed = job.opts.attempts ?? 1;
      const isLastFail = job.attemptsMade >= attemptsAllowed;
      if (isLastFail && job.name === "generateStory") {
        try {
          await storyModule.service.decrementLimitCount(job.data.userId);
        } catch (error) {
          logger.error("Failed to decrement limit count", error);
        }
      }
    });

    process.on("SIGINT", async () => {
      await this.worker.close();
      process.exit(0);
    });
  }

  async processor(job: Job) {
    logger.info(`Processing job ${job.id}: ${job.name}`);

    try {
      const handler = this.handlers.get(job.name);
      if (handler) {
        const result = await handler(job);
        return result;
      } else {
        throw new CustomError("Unknown task name", 500, null, { name: job.name });
      }
    } catch (error) {
      logger.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  }
}
