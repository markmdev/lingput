import { Request, Response } from "express";
import { VocabularyService } from "./vocabularyService";
import { formatResponse } from "@/middlewares/responseFormatter";
import { BadRequestError } from "@/errors/BadRequestError";
const vocabularyService = new VocabularyService();

export class VocabularyController {
  async getAllWordsController(req: Request, res: Response) {
    const { userId } = req.user;
    const words = await vocabularyService.getWords(userId);
    res.status(200).json(formatResponse(words));
  }

  async saveNewWordController(req: Request, res: Response) {
    const { userId } = req.user;
    const { word, translation, article } = req.body;
    const newWord = await vocabularyService.saveNewWord({ word, translation, article, userId });
    res.status(201).json(formatResponse(newWord));
  }

  async saveManyWordsController(req: Request, res: Response) {
    const { userId } = req.user;
    const { words } = req.body;
    const savedWords = await vocabularyService.saveManyWords(words, userId);
    res.status(201).json(formatResponse(savedWords));
  }

  async deleteWordController(req: Request, res: Response) {
    const { userId } = req.user;
    const wordId = parseInt(req.params.id);
    await vocabularyService.deleteWord(wordId, userId);
    res.status(204).json(formatResponse({ status: "success" }));
  }
}
