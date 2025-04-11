import { Request, Response } from "express";
import { StoriesService } from "./storiesService";
import { UnknownWordService } from "../unknownWord/unknownWordService";
import { StoryAudioStorageService } from "./services/storyAudioStorageService";
import { UnknownWord } from "@prisma/client";
import { validateData } from "@/validation/validateData";
import { storySubjectRequestSchema } from "./schemas/storySubjectSchema";
import { formatResponse } from "@/middlewares/responseFormatter";
const storiesService = new StoriesService();
const unknownWordService = new UnknownWordService();
const storyAudioStorageService = new StoryAudioStorageService();

export class StoriesController {
  generateStory = async (req: Request, res: Response) => {
    const { subject } = validateData(storySubjectRequestSchema, req.body);
    const user = req.user;
    const { story, unknownWords } = await storiesService.generateFullStoryExperience(user.userId, subject);
    const savedStory = await storiesService.saveStoryToDB(story);
    const savedUnknownWords = await unknownWordService.saveUnknownWords(unknownWords, savedStory.id);
    const unknownWordIds = this.extractUnknownWordIds(savedUnknownWords);
    const storyWithUnknownWords = await storiesService.connectUnknownWords(savedStory.id, unknownWordIds);

    res.status(200).json(formatResponse(storyWithUnknownWords));
  };

  getAllStories = async (req: Request, res: Response) => {
    const user = req.user;
    const stories = await storiesService.getAllStories(user.userId);
    res.status(200).json(formatResponse(stories));
  };

  // getStorySignedAudioUrl = async (req: Request, res: Response) => {
  //   const { storyId } = req.params;
  //   const signedUrl = await storyAudioStorageService.getStoryAudioUrl(parseInt(storyId));
  //   res.status(200).json(formatResponse(signedUrl));
  // };

  getStoryById = async (req: Request, res: Response) => {
    const user = req.user;
    const { storyId } = req.params;

    const story = await storiesService.getStoryById(parseInt(storyId), user.userId);
    res.status(200).json(formatResponse(story));
  };

  private extractUnknownWordIds(unknownWords: UnknownWord[]): { id: number }[] {
    return unknownWords.map((word) => ({
      id: word.id,
    }));
  }
}

export default StoriesController;
