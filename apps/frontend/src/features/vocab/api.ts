import { BackendApi } from "@/lib/backendApi";

export class VocabApi extends BackendApi {
  getWordsCount(): Promise<number> {
    return this.fetch<number>("/api/vocab/words-count");
  }
}
