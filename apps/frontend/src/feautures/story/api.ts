import { VocabularyItem } from "@/types/ApiObjects";
import { Story } from "./types";
import { ClientApi } from "@/lib/api.client";

export class StoryApi {
  constructor(private clientApi: ClientApi) {}

  fetch<T>(path: string): Promise<T> {
    return this.clientApi.api<T>({
      path,
      options: {
        method: "GET",
      },
    });
  }

  getAllStories(): Promise<Story[]> {
    return this.fetch<Story[]>("/api/story");
  }

  getAllVocabulary(): Promise<VocabularyItem[]> {
    return this.fetch<VocabularyItem[]>("/api/vocab/allwords");
  }
}
