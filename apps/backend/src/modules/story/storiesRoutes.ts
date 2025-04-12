import { Router } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { createStoriesController } from "./storiesControllerFactory";

const router = Router();

const storyController = createStoriesController();

router.post("/generate", authMiddleware, asyncHandler(storyController.generateStory));
router.get("/", authMiddleware, asyncHandler(storyController.getAllStories));
router.get("/:storyId", authMiddleware, asyncHandler(storyController.getStoryById));
// router.get("/:storyId/audio", authMiddleware, asyncHandler(storyController.getStorySignedAudioUrl));

export default router;
