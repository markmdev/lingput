import { asyncHandler } from "@/middlewares/asyncHandler";
import express, { NextFunction, Request, Response } from "express";
import { VocabularyController } from "./vocabularyController";
import { AuthedRequest } from "@/types/types";

export function buildVocabularyRouter(
  controller: VocabularyController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void,
) {
  const router = express.Router();

  router.get(
    "/words-count",
    authMiddleware,
    asyncHandler<AuthedRequest>(controller.getWordsCount),
  );
  router.get(
    "/words",
    authMiddleware,
    asyncHandler<AuthedRequest>(controller.getAllWords),
  );
  router.get(
    "/allwords",
    authMiddleware,
    asyncHandler<AuthedRequest>(controller.getWordsWithoutPagination),
  );
  router.post(
    "/words",
    authMiddleware,
    asyncHandler<AuthedRequest>(controller.saveNewWord),
  );
  router.post(
    "/words/list",
    authMiddleware,
    asyncHandler<AuthedRequest>(controller.saveManyWords),
  );
  router.delete(
    "/words/:id",
    authMiddleware,
    asyncHandler<AuthedRequest>(controller.deleteWord),
  );
  router.patch(
    "/words/:id",
    authMiddleware,
    asyncHandler<AuthedRequest>(controller.updateWord),
  );

  return router;
}
