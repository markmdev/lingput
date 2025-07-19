import { NextFunction, Router, Request, Response } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { UnknownWordController } from "./unknownWordController";
import { AuthedRequest } from "@/types/types";

export function buildUnknownWordRouter(
  controller: UnknownWordController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
) {
  const router = Router();

  router.post(
    "/mark-as-learned/:wordId",
    authMiddleware,
    asyncHandler<AuthedRequest>(controller.markAsLearned)
  );
  router.post(
    "/mark-as-learning/:wordId",
    authMiddleware,
    asyncHandler<AuthedRequest>(controller.markAsLearning)
  );
  router.get("/words", authMiddleware, asyncHandler<AuthedRequest>(controller.getAllWords));

  return router;
}
