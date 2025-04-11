import { Request, Response } from "express";
import { VocabularyService } from "./vocabularyService";
import { formatResponse } from "@/middlewares/responseFormatter";
import { BadRequestError } from "@/errors/BadRequestError";
const vocabularyService = new VocabularyService();

export class VocabularyController {
  async getAllWordsController(req: Request, res: Response) {
    const words = await vocabularyService.getWords();
    res.status(200).json(formatResponse(words));
  }

  async saveNewWordController(req: Request, res: Response) {
    const { word, translation, article } = req.body;
    const newWord = await vocabularyService.saveNewWord({ word, translation, article });
    res.status(201).json(formatResponse(newWord));
  }

  async saveManyWordsController(req: Request, res: Response) {
    const { words } = req.body;
    if (!Array.isArray(words)) {
      throw new BadRequestError("The request body must be an array of objects.");
    }

    const allWordsValid = words.every((wordObj) => wordObj.word && wordObj.translation);
    if (!allWordsValid) {
      throw new BadRequestError("Each word must have a 'word' and 'translation' property.");
    }

    const savedWords = await vocabularyService.saveManyWords(words);
    res.status(201).json(formatResponse(savedWords));
  }

  async deleteWordController(req: Request, res: Response) {
    const wordId = parseInt(req.params.id);
    await vocabularyService.deleteWord(wordId);
    res.status(204).json(formatResponse({ status: "success" }));
  }
}
