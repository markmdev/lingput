import { Router } from "express";
import { UnknownWordController } from "./unknownWordController";
import { asyncHandler } from "@/middlewares/asyncHandler";
const router = Router();

const unknownWordController = new UnknownWordController();

router.post("/mark-as-learned/:wordId", asyncHandler(unknownWordController.markAsLearned));
router.post("/mark-as-learning/:wordId", asyncHandler(unknownWordController.markAsLearning));

export default router;
