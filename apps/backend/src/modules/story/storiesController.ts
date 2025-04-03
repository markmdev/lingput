import { Request, Response } from "express";
import { StoriesService } from "./storiesService";
const storiesService = new StoriesService();

export class StoriesController {
  async generateStory(req: Request, res: Response) {
    const { subject } = req.body;
    const filename = await storiesService.generateFullStoryExperience(subject);

    res.status(200).json({ filename });
  }
}

export default StoriesController;
