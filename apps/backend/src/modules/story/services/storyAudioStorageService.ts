import { Base64 } from "@/types/types";
import { StoriesRepository } from "../storiesRepository";
const storiesRepository = new StoriesRepository();
export class StoryAudioStorageService {
  public async saveToStorage(audio: Base64): Promise<string> {
    return await storiesRepository.saveStoryAudioToStorage(audio);
  }

  public async getStoryAudioUrl(storyId: number): Promise<string> {
    const story = await storiesRepository.getStoryById(storyId);

    return await storiesRepository.getSignedStoryAudioUrl(story.audioUrl, storyId);
  }
}
