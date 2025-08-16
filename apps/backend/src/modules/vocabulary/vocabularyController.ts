import { Request, Response } from "express";
import { VocabularyService } from "./vocabularyService";
import { formatResponse } from "@/middlewares/responseFormatter";
import { validateData } from "@/validation/validateData";
import { z } from "zod";
import { AuthError } from "@/errors/auth/AuthError";
import { AuthedRequest } from "@/types/types";

export class VocabularyController {
  constructor(private vocabularyService: VocabularyService) {}

  getWordsCount = async (req: AuthedRequest, res: Response) => {
    const user = req.user;
    const { userId } = user;

    const wordsCount = await this.vocabularyService.getWordsCount(userId);
    res.status(200).json(formatResponse(wordsCount));
  };

  getAllWords = async (req: AuthedRequest, res: Response) => {
    const user = req.user;

    const { userId } = user;
    const { page, pageSize } = validateData(
      z.object({
        page: z.coerce.number().gt(0).default(1),
        pageSize: z.coerce
          .number()
          .gt(0)
          .lt(200, { message: "Maximum pageSize is 200" })
          .default(20),
      }),
      req.query
    );
    const result = await this.vocabularyService.getWords(userId, page, pageSize);
    res.status(200).json(formatResponse(result.data, result.pagination));
  };

  getWordsWithoutPagination = async (req: AuthedRequest, res: Response) => {
    const user = req.user;

    const { userId } = user;

    const result = await this.vocabularyService.getWordsWithoutPagination(userId);
    res.status(200).json(formatResponse(result));
  };

  saveNewWord = async (req: AuthedRequest, res: Response) => {
    const user = req.user;

    const { userId } = user;
    const { word, translation, article } = validateData(
      z.object({
        word: z.string().min(1).max(50),
        translation: z.string().min(1).max(50),
        article: z.string().min(1).max(15).nullable(),
      }),
      req.body
    );
    const newWord = await this.vocabularyService.saveNewWord({
      word,
      translation,
      article,
      userId,
    });
    res.status(201).json(formatResponse(newWord));
  };

  saveManyWords = async (req: AuthedRequest, res: Response) => {
    const user = req.user;

    const { userId } = user;
    const { words } = validateData(
      z.object({
        words: z.array(
          z.object({
            word: z.string().min(1).max(50),
            translation: z.string().min(1).max(50),
            article: z.string().min(1).max(15).nullable(),
          })
        ),
      }),
      req.body
    );
    const savedWords = await this.vocabularyService.saveManyWords(words, userId);
    res.status(201).json(formatResponse(savedWords));
  };

  deleteWord = async (req: AuthedRequest, res: Response) => {
    const user = req.user;

    const { userId } = user;
    const wordId = validateData(z.coerce.number(), req.params.id);
    await this.vocabularyService.deleteWord(wordId, userId);
    res.status(204).send();
  };

  getWordById = async (req: AuthedRequest, res: Response) => {
    const user = req.user;

    const { userId } = user;
    const wordId = validateData(z.coerce.number(), req.params.id);
    const word = await this.vocabularyService.getWordByID(wordId, userId);
    res.status(200).json(formatResponse(word));
  };

  updateWord = async (req: AuthedRequest, res: Response) => {
    const user = req.user;

    const { userId } = user;
    const wordId = validateData(z.coerce.number(), req.params.id);
    const wordData = validateData(
      z.object({
        word: z.string().min(1).max(50).optional(),
        translation: z.string().min(1).max(50).optional(),
        article: z.string().min(1).max(15).nullable().optional(),
      }),
      req.body
    );
    const updatedWord = await this.vocabularyService.updateWord(wordId, userId, wordData);
    res.status(200).json(formatResponse(updatedWord));
  };
}
