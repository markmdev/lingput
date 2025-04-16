import { Request, Response } from "express";
import { VocabularyService } from "./vocabularyService";
import { formatResponse } from "@/middlewares/responseFormatter";
const vocabularyService = new VocabularyService();

export class VocabularyController {
  async getAllWords(req: Request, res: Response) {
    const { userId } = req.user;
    const words = await vocabularyService.getWords(userId);
    res.status(200).json(formatResponse(words));
  }

  async saveNewWord(req: Request, res: Response) {
    const { userId } = req.user;
    const { word, translation, article } = req.body;
    const newWord = await vocabularyService.saveNewWord({ word, translation, article, userId });
    res.status(201).json(formatResponse(newWord));
  }

  async saveManyWords(req: Request, res: Response) {
    const { userId } = req.user;
    const { words } = req.body;
    const savedWords = await vocabularyService.saveManyWords(words, userId);
    res.status(201).json(formatResponse(savedWords));
  }

  async deleteWord(req: Request, res: Response) {
    const { userId } = req.user;
    const wordId = parseInt(req.params.id);
    await vocabularyService.deleteWord(wordId, userId);
    res.status(204).json(formatResponse({ status: "success" }));
  }

  async getWordById(req: Request, res: Response) {
    const { userId } = req.user;
    const wordId = parseInt(req.params.id);
    const word = await vocabularyService.getWordByID(wordId, userId);
    res.status(200).json(formatResponse(word));
  }

  async updateWord(req: Request, res: Response) {
    const { userId } = req.user;
    const { wordData } = req.body;
    const wordId = parseInt(req.params.id);
    const updatedWord = await vocabularyService.updateWord(wordId, userId, wordData);
    res.status(201).json(updatedWord);
  }
}
