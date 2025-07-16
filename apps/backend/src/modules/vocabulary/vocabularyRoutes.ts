import { asyncHandler } from "@/middlewares/asyncHandler";
import express, { NextFunction, Request, Response } from "express";
import { VocabularyController } from "./vocabularyController";

export function buildVocabularyRouter(
  controller: VocabularyController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
) {
  const router = express.Router();

  router.get("/words", authMiddleware, asyncHandler(controller.getAllWords));
  router.get("/allwords", authMiddleware, asyncHandler(controller.getWordsWithoutPagination));
  router.post("/words", authMiddleware, asyncHandler(controller.saveNewWord));
  router.post("/words/list", authMiddleware, asyncHandler(controller.saveManyWords));
  router.delete("/words/:id", authMiddleware, asyncHandler(controller.deleteWord));
  router.patch("/words/:id", authMiddleware, asyncHandler(controller.updateWord));

  return router;
}
