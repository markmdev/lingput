import { Request, Response, NextFunction, Router } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { JobsController } from "./jobsController";
import { AuthedRequest } from "@/types/types";

export function buildJobsRouter(
  controller: JobsController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
) {
  const router = Router();

  router.get("/status/:jobId", authMiddleware, asyncHandler<AuthedRequest>(controller.jobStatus));
  return router;
}
