import { VocabularyController } from "./vocabularyController";
import { VocabularyRepository } from "./vocabularyRepository";
import { VocabularyService } from "./vocabularyService";
import { PrismaClient } from "@prisma/client";
import { buildVocabularyRouter } from "./vocabularyRoutes";
import { NextFunction, Request, Response } from "express";

export function createVocabularyModule(deps: {
  prisma: PrismaClient;
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
}) {
  const repository = new VocabularyRepository(deps.prisma);
  const service = new VocabularyService(repository);
  const controller = new VocabularyController(service);
  return { service, controller, router: buildVocabularyRouter(controller, deps.authMiddleware) };
}
