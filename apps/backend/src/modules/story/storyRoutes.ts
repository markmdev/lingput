import { NextFunction, Router, Request, Response } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { StoryController } from "./storyController";

export function buildStoryRouter(
  controller: StoryController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
) {
  const router = Router();
  router.post("/generate", authMiddleware, asyncHandler(controller.generateStory));
  router.get("/", authMiddleware, asyncHandler(controller.getAllStories));

  return router;
}
