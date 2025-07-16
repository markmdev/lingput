import { NextFunction, Router, Request, Response } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { UnknownWordController } from "./unknownWordController";

export function buildUnknownWordRouter(
  controller: UnknownWordController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
) {
  const router = Router();

  router.post("/mark-as-learned/:wordId", authMiddleware, asyncHandler(controller.markAsLearned));
  router.post("/mark-as-learning/:wordId", authMiddleware, asyncHandler(controller.markAsLearning));
  router.get("/words", authMiddleware, asyncHandler(controller.getAllWords));
  // router.get("/job/:jobId", authMiddleware, asyncHandler(controller.jobStatus));

  return router;
}
