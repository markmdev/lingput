import { asyncHandler } from "@/middlewares/asyncHandler";
import { NextFunction, Router, Request, Response } from "express";
import { VocabAssessmentController } from "./vocabAssessmentController";

export function buildVocabAssessmentRouter(
  controller: VocabAssessmentController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void,
) {
  const router = Router();

  router.get("/start", authMiddleware, asyncHandler(controller.start));
  router.post("/answer", authMiddleware, asyncHandler(controller.answer));

  return router;
}
