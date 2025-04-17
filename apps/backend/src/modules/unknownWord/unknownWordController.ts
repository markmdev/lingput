import { Request, Response } from "express";
import { UnknownWordService } from "./unknownWordService";
import { validateData } from "@/validation/validateData";
import { wordIdRequestSchema } from "./schemas/wordIdSchema";
import { formatResponse } from "@/middlewares/responseFormatter";

const unknownWordService = new UnknownWordService();

export class UnknownWordController {
  async markAsLearned(req: Request, res: Response) {
    const { wordId } = validateData(wordIdRequestSchema, req.params);
    await unknownWordService.markAsLearned(wordId);
    res.status(200).json(formatResponse({ message: "Word marked as learned" }));
  }

  async markAsLearning(req: Request, res: Response) {
    const { wordId } = validateData(wordIdRequestSchema, req.params);
    await unknownWordService.markAsLearning(wordId);
    res.status(200).json(formatResponse({ message: "Word marked as learning" }));
  }

  async getAllWords(req: Request, res: Response) {
    const user = req.user;
    const words = await unknownWordService.getUnknownWords(user.userId);
    return res.status(200).json(formatResponse(words));
  }
}
