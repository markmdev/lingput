import express from "express";
const router = express.Router();
import { asyncHandler } from "@/middlewares/asyncHandler";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { createVocabularyController } from "./vocabularyControllerFactory";

const vocabularyController = createVocabularyController();

router.get("/words", authMiddleware, asyncHandler(vocabularyController.getAllWords));

router.post("/words", authMiddleware, asyncHandler(vocabularyController.saveNewWord));

router.post("/words/list", authMiddleware, asyncHandler(vocabularyController.saveManyWords));

router.delete("/words/:id", authMiddleware, asyncHandler(vocabularyController.deleteWord));

router.patch("/words/:id", authMiddleware, asyncHandler(vocabularyController.updateWord));

export default router;
