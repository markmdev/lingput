import { Request, Response } from "express";
import { StoriesService } from "./storiesService";
import { UnknownWordService } from "../unknownWord/unknownWordService";
import { StoryAudioStorageService } from "./services/storyAudioStorageService";
const storiesService = new StoriesService();
const unknownWordService = new UnknownWordService();
const storyAudioStorageService = new StoryAudioStorageService();

export class StoriesController {
  async generateStory(req: Request, res: Response) {
    const { subject } = req.body;
    const story = await storiesService.generateFullStoryExperience(subject);
    const savedStory = await storiesService.saveStoryToDB(story);
    const unknownWords = await unknownWordService.saveUnknownWords(
      story.unknownWords,
      savedStory.id
    );
    res.status(200).json({ story: savedStory, unknownWords });
  }

  async getAllStories(req: Request, res: Response) {
    const stories = await storiesService.getAllStories();
    res.status(200).json(stories);
  }

  async getStorySignedAudioUrl(req: Request, res: Response) {
    const { storyId } = req.params;
    const signedUrl = await storyAudioStorageService.getStoryAudioUrl(
      parseInt(storyId)
    );
    res.status(200).json({ signedUrl });
  }
}

export default StoriesController;
