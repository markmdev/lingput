import { Request, Response } from "express";
import { UnknownWordService } from "./unknownWordService";
import { validateData } from "@/validation/validateData";
import { wordIdRequestSchema } from "./schemas/wordIdSchema";
import { formatResponse } from "@/middlewares/responseFormatter";

export class UnknownWordController {
  constructor(private unknownWordService: UnknownWordService) {}
  markAsLearned = async (req: Request, res: Response) => {
    const { wordId } = validateData(wordIdRequestSchema, req.params);
    const user = req.user;
    const job = await this.unknownWordService.markAsLearned(wordId, user.userId);
    res.status(200).json(formatResponse(job));
  };

  markAsLearning = async (req: Request, res: Response) => {
    const { wordId } = validateData(wordIdRequestSchema, req.params);
    const user = req.user;
    const job = await this.unknownWordService.markAsLearning(wordId, user.userId);
    res.status(200).json(formatResponse(job));
  };

  getAllWords = async (req: Request, res: Response) => {
    const user = req.user;
    const words = await this.unknownWordService.getUnknownWords(user.userId);
    return res.status(200).json(formatResponse(words));
  };
}
