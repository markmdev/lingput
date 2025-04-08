import { Router } from "express";
import StoriesController from "./storiesController";
import { asyncHandler } from "@/middlewares/asyncHandler";

const router = Router();

const storiesController = new StoriesController();

router.post("/generate", asyncHandler(storiesController.generateStory));
router.get("/", asyncHandler(storiesController.getAllStories));
router.get("/:storyId/audio", asyncHandler(storiesController.getStorySignedAudioUrl));

export default router;
