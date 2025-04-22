import { asyncHandler } from "@/middlewares/asyncHandler";
import { authMiddleware } from "@/middlewares/authMiddlewareFactory";
import express from "express";
import { vocabularyController } from "./composition";

const router = express.Router();

router.get("/words", authMiddleware, asyncHandler(vocabularyController.getAllWords));
router.post("/words", authMiddleware, asyncHandler(vocabularyController.saveNewWord));
router.post("/words/list", authMiddleware, asyncHandler(vocabularyController.saveManyWords));
router.delete("/words/:id", authMiddleware, asyncHandler(vocabularyController.deleteWord));
router.patch("/words/:id", authMiddleware, asyncHandler(vocabularyController.updateWord));

export default router;
