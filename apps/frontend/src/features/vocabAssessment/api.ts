import { AssessmentResponse } from "./types";
import { BackendApi } from "@/lib/backendApi";

export class VocabAssessmentApi extends BackendApi {
  skip() {
    return this.post("/api/vocab-assessment/skip");
  }

  start(): Promise<AssessmentResponse> {
    return this.fetch("/api/vocab-assessment/start");
  }

  continue(sessionUUID: string, wordsData?: Record<string, boolean>): Promise<AssessmentResponse> {
    return this.post<AssessmentResponse>("/api/vocab-assessment/answer", {
      sessionUUID,
      wordsData,
    });
  }
}
