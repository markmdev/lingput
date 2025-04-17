import { Request, Response } from "express";
import { UnknownWordService } from "./unknownWordService";
import { validateData } from "@/validation/validateData";
import { wordIdRequestSchema } from "./schemas/wordIdSchema";
import { formatResponse } from "@/middlewares/responseFormatter";

export class UnknownWordController {
  constructor(private unknownWordService: UnknownWordService) {}
  async markAsLearned(req: Request, res: Response) {
    const { wordId } = validateData(wordIdRequestSchema, req.params);
    await this.unknownWordService.markAsLearned(wordId);
    res.status(200).json(formatResponse({ message: "Word marked as learned" }));
  }

  async markAsLearning(req: Request, res: Response) {
    const { wordId } = validateData(wordIdRequestSchema, req.params);
    await this.unknownWordService.markAsLearning(wordId);
    res.status(200).json(formatResponse({ message: "Word marked as learning" }));
  }

  async getAllWords(req: Request, res: Response) {
    const user = req.user;
    const words = await this.unknownWordService.getUnknownWords(user.userId);
    return res.status(200).json(formatResponse(words));
  }
}
