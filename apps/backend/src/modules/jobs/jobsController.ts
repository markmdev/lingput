import { Request, Response } from "express";
import { formatErrorResponse, formatResponse } from "@/middlewares/responseFormatter";
import { Job, Queue } from "bullmq";

export class JobsController {
  constructor(private queue: Queue) {}
  jobStatus = async (req: Request, res: Response) => {
    const { jobId } = req.params;

    const job: Job = await this.queue.getJob(jobId);
    if (!job) {
      return res
        .status(404)
        .json(formatErrorResponse({ message: "Job not found", statusCode: 404 }));
    }
    const state = await job.getState();
    res
      .status(200)
      .json(
        formatResponse({
          status: state,
          value: job.returnvalue,
          failedReason: job.failedReason,
          progress: job.progress,
        })
      );
  };
}
