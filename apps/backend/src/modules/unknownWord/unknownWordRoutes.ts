import { Router } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { authMiddleware } from "@/middlewares/authMiddlewareFactory";
import { unknownWordController } from "./composition";
const router = Router();

router.post(
  "/mark-as-learned/:wordId",
  authMiddleware,
  asyncHandler(unknownWordController.markAsLearned)
);
router.post(
  "/mark-as-learning/:wordId",
  authMiddleware,
  asyncHandler(unknownWordController.markAsLearning)
);
router.get("/words", authMiddleware, asyncHandler(unknownWordController.getAllWords));
// router.get("/job/:jobId", authMiddleware, asyncHandler(unknownWordController.jobStatus));

export default router;
