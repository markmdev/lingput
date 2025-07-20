import { VocabularyItem } from "@/types/ApiObjects";
import { Story } from "./types";
import { BackendApi } from "@/lib/backendApi";

export class StoryApi extends BackendApi {
  getAllStories(): Promise<Story[]> {
    return this.fetch<Story[]>("/api/story");
  }

  getAllVocabulary(): Promise<VocabularyItem[]> {
    return this.fetch<VocabularyItem[]>("/api/vocab/allwords");
  }

  generateNewStory(topic: string): Promise<Story> {
    return this.post<Story>("/api/story/generate", {
      subject: topic,
      languageCode: "DE",
      originalLanguageCode: "EN",
    });
  }
}
