import express from "express";
const router = express.Router();
import { VocabularyController } from "./vocabularyController";
import { asyncHandler } from "@/middlewares/asyncHandler";

const vocabularyController = new VocabularyController();

router.get("/words", asyncHandler(vocabularyController.getAllWordsController));

router.post("/words", asyncHandler(vocabularyController.saveNewWordController));

router.post("/words/list", asyncHandler(vocabularyController.saveManyWordsController));

router.delete("/words/:id", asyncHandler(vocabularyController.deleteWordController));

export default router;
