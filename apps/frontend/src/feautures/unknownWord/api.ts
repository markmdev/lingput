import { BackendApi } from "@/lib/backendApi.client";

export class UnknownWordApi extends BackendApi {
  async markAsLearned(wordId: number) {
    return this.post(`/api/unknown-words/mark-as-learned/${wordId}`);
  }
  async markAsLearning(wordId: number) {
    return this.post(`/api/unknown-words/mark-as-learning/${wordId}`);
  }
}
