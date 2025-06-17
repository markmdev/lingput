import { FeatureApi } from "@/lib/FeatureApi";
import { AssessmentResponse } from "./types";

export class VocabAssessmentApi extends FeatureApi {
  start(): Promise<AssessmentResponse> {
    return this.fetch("/api/vocab-assessment/start");
  }

  continue(sessionUUID: string, wordsData?: Record<string, boolean>): Promise<AssessmentResponse> {
    return this.clientApi.api({
      path: "/api/vocab-assessment/answer",
      options: {
        method: "POST",
        body: JSON.stringify({
          sessionUUID,
          wordsData,
        }),
      },
    });
  }
}
