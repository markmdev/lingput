import { asyncHandler } from "@/middlewares/asyncHandler";
import { authMiddleware } from "@/middlewares/authMiddlewareFactory";
import { Router } from "express";
import { vocabAssessmentController } from "./composition";

const router = Router();

router.get("/start", authMiddleware, asyncHandler(vocabAssessmentController.start));
router.post("/answer", authMiddleware, asyncHandler(vocabAssessmentController.answer));

export default router;
