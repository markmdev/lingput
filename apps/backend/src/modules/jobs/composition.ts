import { NextFunction, Request, Response } from "express";
import { JobsController } from "./jobsController";
import { buildJobsRouter } from "./jobsRoutes";

export function createJobsModule(
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
) {
  const controller = new JobsController();
  return { controller, router: buildJobsRouter(controller, authMiddleware) };
}
