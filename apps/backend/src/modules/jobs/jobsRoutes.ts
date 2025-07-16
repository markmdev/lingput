import { Request, Response, NextFunction, Router } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { JobsController } from "./jobsController";

export function buildJobsRouter(
  controller: JobsController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
) {
  const router = Router();

  router.get("/status/:queue/:jobId", authMiddleware, asyncHandler(controller.jobStatus));
  return router;
}
