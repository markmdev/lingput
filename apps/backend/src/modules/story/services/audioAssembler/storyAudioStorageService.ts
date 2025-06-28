import { Base64 } from "@/types/types";
import { StoryRepository } from "../../storyRepository";

export class StoryAudioStorageService {
  constructor(private storyRepository: StoryRepository) {}
  public async saveToStorage(audio: Base64): Promise<string> {
    return await this.storyRepository.saveStoryAudioToStorage(audio);
  }

  // public async getStoryAudioUrl(storyId: number): Promise<string> {
  //   const story = await this.storyRepository.getStoryById(storyId);

  //   return await this.storyRepository.getSignedStoryAudioUrl(story.audioUrl, storyId);
  // }
}
