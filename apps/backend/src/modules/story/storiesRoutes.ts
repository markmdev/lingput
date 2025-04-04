import { Router } from "express";
import StoriesController from "./storiesController";

const router = Router();

const storiesController = new StoriesController();

router.post("/generate", storiesController.generateStory);
router.get("/", storiesController.getAllStories);
export default router;
