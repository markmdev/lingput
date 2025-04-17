import { Router } from "express";
import { UnknownWordController } from "./unknownWordController";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { authMiddleware } from "@/middlewares/authMiddleware";
const router = Router();

const unknownWordController = new UnknownWordController();

router.post("/mark-as-learned/:wordId", authMiddleware, asyncHandler(unknownWordController.markAsLearned));
router.post("/mark-as-learning/:wordId", authMiddleware, asyncHandler(unknownWordController.markAsLearning));
router.get("/words", authMiddleware, asyncHandler(unknownWordController.getAllWords));

export default router;
