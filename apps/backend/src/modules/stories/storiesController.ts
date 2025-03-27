import { Request, Response } from "express";
import { StoriesService } from "./storiesService";
const storiesService = new StoriesService();

export class StoriesController {
  async generateStory(req: Request, res: Response) {
    const audio = await storiesService.generateFullStoryExperience();

    res.status(200).json({ audio });
  }
}

export default StoriesController;
