import { Base64 } from "../../types/types";
import { StoriesRepository } from "./storiesRepository";
const storiesRepository = new StoriesRepository();
export class StoryAudioStorageService {
  public async saveToStorage(audio: Base64): Promise<string> {
    const response = await storiesRepository.saveStoryAudioToStorage(audio);
    if (response.error) {
      throw new Error("Error saving story audio to storage");
    }
    if (!response.data) {
      throw new Error("No file name returned from storage service");
    }
    return response.data.path;
  }

  public async getStoryAudioUrl(storyId: number): Promise<string> {
    const story = await storiesRepository.getStoryById(storyId);
    if (story.error) {
      throw new Error("Error getting story");
    }
    if (!story.data) {
      throw new Error("No story returned from database");
    }
    const response = await storiesRepository.getSignedStoryAudioUrl(
      story.data.audio_url
    );
    if (response.error) {
      throw new Error("Error getting signed story audio url");
    }
    if (!response.data) {
      throw new Error(
        "No signed story audio url returned from storage service"
      );
    }
    return response.data.signedUrl;
  }
}
