import { Request, Response } from "express";
import { StoriesService } from "./storyService";
import { UnknownWordService } from "../unknownWord/unknownWordService";
import { UnknownWord } from "@prisma/client";
import { validateData } from "@/validation/validateData";
import { storySubjectRequestSchema } from "./schemas/storySubjectSchema";
import { formatResponse } from "@/middlewares/responseFormatter";
import { logger } from "@/utils/logger";
import { z } from "zod";
import { AuthError } from "@/errors/auth/AuthError";
import { AuthedRequest } from "@/types/types";

export class StoryController {
  constructor(
    private storiesService: StoriesService,
    private unknownWordService: UnknownWordService
  ) {}

  generateStory = async (req: AuthedRequest, res: Response) => {
    const { subject } = validateData(storySubjectRequestSchema, req.body);
    const { languageCode, originalLanguageCode } = validateData(
      z.object({ languageCode: z.enum(["DE", "EN"]), originalLanguageCode: z.enum(["DE", "EN"]) }),
      req.body
    );
    const user = req.user;

    const job = await this.storiesService.generateFullStoryExperience(
      user.userId,
      languageCode,
      originalLanguageCode,
      subject
    );

    // logger.info(
    //   `User ${user.userId} generated a story. Story ID: ${savedStory.id}. New unknown words: ${unknownWordIds.length}. Known words used: ${knownWords.length}`
    // );

    res.status(200).json(formatResponse(job));
  };

  getAllStories = async (req: AuthedRequest, res: Response) => {
    const user = req.user;

    const stories = await this.storiesService.getAllStories(user.userId);
    res.status(200).json(formatResponse(stories));
  };

  private extractUnknownWordIds(unknownWords: UnknownWord[]): { id: number }[] {
    return unknownWords.map((word) => ({
      id: word.id,
    }));
  }
}
