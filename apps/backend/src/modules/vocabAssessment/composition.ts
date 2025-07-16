import { VocabAssessmentController } from "./vocabAssessmentController";
import { VocabAssessmentRepository } from "./vocabAssessmentRepository";
import { VocabAssessmentService } from "./vocabAssessmentService";
import { AppRedisClient } from "@/services/redis";
import { RedisWordsCache } from "@/cache/redisWordsCache";
import { SessionService } from "../session/sessionService";
import { VocabularyService } from "../vocabulary/vocabularyService";
import { PrismaClient } from "@prisma/client";
import { buildVocabAssessmentRouter } from "./vocabAssessmentRoutes";
import { NextFunction, Request, Response } from "express";

export function createVocabAssessmentModule(deps: {
  prisma: PrismaClient;
  redis: AppRedisClient;
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
  sessionService: SessionService;
  vocabularyService: VocabularyService;
}) {
  const repository = new VocabAssessmentRepository(deps.prisma);
  const cache = new RedisWordsCache(deps.redis);
  const service = new VocabAssessmentService(
    repository,
    deps.sessionService,
    deps.vocabularyService,
    cache
  );

  const controller = new VocabAssessmentController(service);
  return { controller, router: buildVocabAssessmentRouter(controller, deps.authMiddleware) };
}
