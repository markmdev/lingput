import express from "express";
const router = express.Router();
import { VocabularyController } from "./vocabularyController";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { authMiddleware } from "@/middlewares/authMiddleware";

const vocabularyController = new VocabularyController();

router.get("/words/:id", authMiddleware, asyncHandler(vocabularyController.getWordById));

router.get("/words", authMiddleware, asyncHandler(vocabularyController.getAllWordsController));

router.post("/words", authMiddleware, asyncHandler(vocabularyController.saveNewWordController));

router.post("/words/list", authMiddleware, asyncHandler(vocabularyController.saveManyWordsController));

router.delete("/words/:id", authMiddleware, asyncHandler(vocabularyController.deleteWordController));

router.patch("/words/:id", authMiddleware, asyncHandler(vocabularyController.updateWord));

export default router;
