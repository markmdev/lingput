import { Router } from "express";
import { UnknownWordController } from "./unknownWordController";

const router = Router();

const unknownWordController = new UnknownWordController();

router.post("/mark-as-learned/:wordId", unknownWordController.markAsLearned);
router.post("/mark-as-learning/:wordId", unknownWordController.markAsLearning);

export default router;
