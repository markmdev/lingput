import { Router } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { authMiddleware } from "@/middlewares/authMiddlewareFactory";
import { storyController } from "./composition";

const router = Router();

router.post("/generate", authMiddleware, asyncHandler(storyController.generateStory));
router.get("/", authMiddleware, asyncHandler(storyController.getAllStories));

export default router;
