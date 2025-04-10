import { Router } from "express";
import StoriesController from "./storiesController";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { authMiddleware } from "@/middlewares/authMiddleware";

const router = Router();

const storiesController = new StoriesController();

router.post("/generate", authMiddleware, asyncHandler(storiesController.generateStory));
router.get("/", authMiddleware, asyncHandler(storiesController.getAllStories));
router.get("/:storyId", authMiddleware, asyncHandler(storiesController.getStoryById));
// router.get("/:storyId/audio", authMiddleware, asyncHandler(storiesController.getStorySignedAudioUrl));

export default router;
