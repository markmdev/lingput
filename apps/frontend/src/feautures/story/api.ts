import { VocabularyItem } from "@/types/ApiObjects";
import { Story } from "./types";
import { BackendApi, JobResponse } from "@/lib/backendApi";

export class StoryApi extends BackendApi {
  getAllStories(): Promise<Story[]> {
    return this.fetch<Story[]>("/api/story");
  }

  getAllVocabulary(): Promise<VocabularyItem[]> {
    return this.fetch<VocabularyItem[]>("/api/vocab/allwords");
  }

  generateNewStory(topic: string): Promise<JobResponse> {
    return this.post<JobResponse>("/api/story/generate", {
      subject: topic,
      languageCode: "DE",
      originalLanguageCode: "EN",
    });
  }

  checkJobStatus(jobId: string) {
    return this.jobStatus(jobId);
  }
}
