import { NextFunction, Router, Request, Response } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { StoryController } from "./storyController";
import { AuthedRequest } from "@/types/types";

export function buildStoryRouter(
  controller: StoryController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
) {
  const router = Router();
  router.post("/generate", authMiddleware, asyncHandler<AuthedRequest>(controller.generateStory));
  router.get("/", authMiddleware, asyncHandler<AuthedRequest>(controller.getAllStories));

  return router;
}
