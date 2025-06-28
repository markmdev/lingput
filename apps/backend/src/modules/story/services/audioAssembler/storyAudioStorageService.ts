import { Base64 } from "@/types/types";
import { StoryRepository } from "../../storyRepository";

export class StoryAudioStorageService {
  constructor(private storyRepository: StoryRepository) {}
  public async saveToStorage(audio: Base64): Promise<string> {
    return await this.storyRepository.saveStoryAudioToStorage(audio);
  }
}
