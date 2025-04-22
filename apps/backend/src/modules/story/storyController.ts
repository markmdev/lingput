import { Request, Response } from "express";
import { StoriesService } from "./storyService";
import { UnknownWordService } from "../unknownWord/unknownWordService";
import { UnknownWord } from "@prisma/client";
import { validateData } from "@/validation/validateData";
import { storySubjectRequestSchema } from "./schemas/storySubjectSchema";
import { formatResponse } from "@/middlewares/responseFormatter";
import { logger } from "@/utils/logger";
import { z } from "zod";

export class StoryController {
  constructor(private storiesService: StoriesService, private unknownWordService: UnknownWordService) {}

  generateStory = async (req: Request, res: Response) => {
    const { subject } = validateData(storySubjectRequestSchema, req.body);
    const user = req.user;
    const { story, unknownWords, knownWords } = await this.storiesService.generateFullStoryExperience(
      user.userId,
      subject
    );
    const savedStory = await this.storiesService.saveStoryToDB(story);
    const savedUnknownWords = await this.unknownWordService.saveUnknownWords(unknownWords, savedStory.id, user.userId);

    const unknownWordIds = this.extractUnknownWordIds(savedUnknownWords);
    const storyWithUnknownWords = await this.storiesService.connectUnknownWords(savedStory.id, unknownWordIds);

    logger.info(
      `User ${user.userId} generated a story. Story ID: ${savedStory.id}. New unknown words: ${unknownWordIds.length}. Known words used: ${knownWords.length}`
    );

    res.status(200).json(formatResponse(storyWithUnknownWords));
  };

  getAllStories = async (req: Request, res: Response) => {
    const user = req.user;
    const stories = await this.storiesService.getAllStories(user.userId);
    res.status(200).json(formatResponse(stories));
  };

  getStoryById = async (req: Request, res: Response) => {
    const user = req.user;
    const { storyId } = validateData(
      z.object({
        storyId: z.coerce.number().gt(0),
      }),
      req.params
    );

    const story = await this.storiesService.getStoryById(storyId, user.userId);
    res.status(200).json(formatResponse(story));
  };

  private extractUnknownWordIds(unknownWords: UnknownWord[]): { id: number }[] {
    return unknownWords.map((word) => ({
      id: word.id,
    }));
  }
}
