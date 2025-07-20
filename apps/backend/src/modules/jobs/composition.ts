import { NextFunction, Request, Response } from "express";
import { JobsController } from "./jobsController";
import { buildJobsRouter } from "./jobsRoutes";
import { mainQueue } from "../../services/jobQueue/queue";

export function createJobsModule(
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
) {
  const controller = new JobsController(mainQueue);
  return { controller, router: buildJobsRouter(controller, authMiddleware) };
}
