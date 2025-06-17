import { VocabularyItem } from "@/types/ApiObjects";
import { Story } from "./types";
import { FeatureApi } from "@/lib/FeatureApi";

export class StoryApi extends FeatureApi {
  getAllStories(): Promise<Story[]> {
    return this.fetch<Story[]>("/api/story");
  }

  getAllVocabulary(): Promise<VocabularyItem[]> {
    return this.fetch<VocabularyItem[]>("/api/vocab/allwords");
  }

  generateNewStory(topic: string): Promise<Story> {
    return this.clientApi.api<Story>({
      path: "/api/story/generate",
      options: {
        method: "POST",
        body: JSON.stringify({
          subject: topic,
          languageCode: "DE",
          originalLanguageCode: "EN",
        }),
      },
    });
  }
}
