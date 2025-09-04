import { Response } from "express";
import { formatResponse } from "@/middlewares/responseFormatter";
import { VocabAssessmentService } from "./vocabAssessmentService";
import { z } from "zod";
import { validateData } from "@/validation/validateData";
import { AuthedRequest } from "@/types/types";

const answerSchema = z.object({
  sessionUUID: z.string(),
  wordsData: z.record(z.string(), z.boolean()).optional(),
});

export class VocabAssessmentController {
  constructor(private vocabAssessmentService: VocabAssessmentService) {}

  skip = async (req: AuthedRequest, res: Response) => {
    const user = req.user;

    await this.vocabAssessmentService.skipAssessment(user.userId, "en", "de");
    res.status(200).json(formatResponse({ success: true }));
  };

  start = async (req: AuthedRequest, res: Response) => {
    const user = req.user;

    const result = await this.vocabAssessmentService.startAssessment(
      user.userId,
      "en",
      "de",
    );
    res.status(200).json(formatResponse(result));
  };

  answer = async (req: AuthedRequest, res: Response) => {
    const user = req.user;

    const { sessionUUID, wordsData } = validateData(answerSchema, req.body);
    const result = await this.vocabAssessmentService.continueAssessment(
      user.userId,
      sessionUUID,
      wordsData,
    );
    res.status(200).json(formatResponse(result));
  };
}
