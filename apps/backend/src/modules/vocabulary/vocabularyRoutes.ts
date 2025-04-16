import express from "express";
const router = express.Router();
import { VocabularyController } from "./vocabularyController";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { authMiddleware } from "@/middlewares/authMiddleware";

const vocabularyController = new VocabularyController();

router.get("/words/:id", authMiddleware, asyncHandler(vocabularyController.getWordById));

router.get("/words", authMiddleware, asyncHandler(vocabularyController.getAllWords));

router.post("/words", authMiddleware, asyncHandler(vocabularyController.saveNewWord));

router.post("/words/list", authMiddleware, asyncHandler(vocabularyController.saveManyWords));

router.delete("/words/:id", authMiddleware, asyncHandler(vocabularyController.deleteWord));

router.patch("/words/:id", authMiddleware, asyncHandler(vocabularyController.updateWord));

export default router;
