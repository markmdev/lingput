import { Request, Response } from "express";
import { UnknownWordService } from "./unknownWordService";

const unknownWordService = new UnknownWordService();

export class UnknownWordController {
  async markAsLearned(req: Request, res: Response) {
    const { wordId } = req.params;
    await unknownWordService.markAsLearned(parseInt(wordId));
    res.status(200).json({ message: "Word marked as learned" });
  }

  async markAsLearning(req: Request, res: Response) {
    const { wordId } = req.params;
    await unknownWordService.markAsLearning(parseInt(wordId));
    res.status(200).json({ message: "Word marked as learning" });
  }
}
