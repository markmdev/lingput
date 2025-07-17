import { Request, Response } from "express";
import { formatErrorResponse, formatResponse } from "@/middlewares/responseFormatter";
import { getQueueByName, QueueNames, queues } from "./queue";
import { Job } from "bullmq";

export class JobsController {
  private isQueueNameValid(name: string): name is QueueNames {
    return Object.keys(queues).includes(name);
  }
  jobStatus = async (req: Request, res: Response) => {
    const { queue, jobId } = req.params;

    if (!this.isQueueNameValid(queue)) {
      return res
        .status(400)
        .json(formatErrorResponse({ message: "Invalid queue name", statusCode: 400 }));
    }

    const queueInstance = getQueueByName(queue);
    const job: Job = await queueInstance.getJob(jobId);
    if (!job) {
      return res
        .status(404)
        .json(formatErrorResponse({ message: "Job not found", statusCode: 404 }));
    }
    const state = await job.getState();
    res.status(200).json(formatResponse({ status: state, value: job.returnvalue }));
  };
}
