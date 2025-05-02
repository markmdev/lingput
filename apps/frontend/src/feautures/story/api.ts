import { VocabularyItem } from "@/types/ApiObjects";
import { Story } from "./types";
import { ClientApi } from "@/lib/api.client";

export class StoryApi {
  constructor(private clientApi: ClientApi) {}

  getAllStories(): Promise<Story[]> {
    return this.clientApi.api<Story[]>({
      path: "/api/story",
      options: {
        method: "GET",
      },
    });
  }

  getAllVocabulary(): Promise<VocabularyItem[]> {
    return this.clientApi.api<VocabularyItem[]>({
      path: "/api/vocab/allwords",
      options: {
        method: "GET",
      },
    });
  }
}
