import { Router } from "express";
import StoriesController from "./storiesController";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { authMiddleware } from "@/middlewares/authMiddleware";

const router = Router();

const storiesController = new StoriesController();

router.post("/generate", asyncHandler(storiesController.generateStory));
router.get("/", authMiddleware, asyncHandler(storiesController.getAllStories));
router.get("/:storyId/audio", asyncHandler(storiesController.getStorySignedAudioUrl));

export default router;
