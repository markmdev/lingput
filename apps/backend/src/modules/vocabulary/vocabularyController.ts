import { Request, Response } from "express";
import { VocabularyService } from "./vocabularyService";
import { formatResponse } from "@/middlewares/responseFormatter";
import { validateData } from "@/validation/validateData";
import { z } from "zod";

export class VocabularyController {
  constructor(private vocabularyService: VocabularyService) {}
  async getAllWords(req: Request, res: Response) {
    const { userId } = req.user;
    const { page, pageSize } = validateData(
      z.object({
        page: z.coerce.number().gt(0).default(1),
        pageSize: z.coerce.number().gt(0).lt(200, { message: "Maximum pageSize is 200" }).default(20),
      }),
      req.query
    );
    const result = await this.vocabularyService.getWords(userId, page, pageSize);
    res.status(200).json(formatResponse(result.data, result.pagination));
  }

  async saveNewWord(req: Request, res: Response) {
    const { userId } = req.user;
    const { word, translation, article } = req.body;
    const newWord = await this.vocabularyService.saveNewWord({ word, translation, article, userId });
    res.status(201).json(formatResponse(newWord));
  }

  async saveManyWords(req: Request, res: Response) {
    const { userId } = req.user;
    const { words } = req.body;
    const savedWords = await this.vocabularyService.saveManyWords(words, userId);
    res.status(201).json(formatResponse(savedWords));
  }

  async deleteWord(req: Request, res: Response) {
    const { userId } = req.user;
    const wordId = parseInt(req.params.id);
    await this.vocabularyService.deleteWord(wordId, userId);
    res.status(204).json(formatResponse({ status: "success" }));
  }

  async getWordById(req: Request, res: Response) {
    const { userId } = req.user;
    const wordId = parseInt(req.params.id);
    const word = await this.vocabularyService.getWordByID(wordId, userId);
    res.status(200).json(formatResponse(word));
  }

  async updateWord(req: Request, res: Response) {
    const { userId } = req.user;
    const { wordData } = req.body;
    const wordId = parseInt(req.params.id);
    const updatedWord = await this.vocabularyService.updateWord(wordId, userId, wordData);
    res.status(201).json(updatedWord);
  }
}
