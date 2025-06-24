import { Request, Response } from "express";
import { formatResponse } from "@/middlewares/responseFormatter";
import { VocabAssessmentService } from "./vocabAssessmentService";
import { z } from "zod";
import { validateData } from "@/validation/validateData";

const answerSchema = z.object({
  sessionUUID: z.string(),
  wordsData: z.record(z.string(), z.boolean()).optional(),
});

export class VocabAssessmentController {
  constructor(private vocabAssessmentService: VocabAssessmentService) {}

  start = async (req: Request, res: Response) => {
    const user = req.user;
    const result = await this.vocabAssessmentService.startAssessment(user.userId, "en", "de");
    res.status(200).json(formatResponse(result));
  };

  answer = async (req: Request, res: Response) => {
    const { sessionUUID, wordsData } = validateData(answerSchema, req.body);
    const result = await this.vocabAssessmentService.continueAssessment(sessionUUID, wordsData);
    res.status(200).json(formatResponse(result));
  };
}
