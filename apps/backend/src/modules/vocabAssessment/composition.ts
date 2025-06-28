import { prisma } from "@/services/prisma";
import { VocabAssessmentController } from "./vocabAssessmentController";
import { VocabAssessmentRepository } from "./vocabAssessmentRepository";
import { VocabAssessmentService } from "./vocabAssessmentService";
import { sessionService } from "../session/composition";
import { vocabularyService } from "../vocabulary/composition";
import redisClient from "@/services/redis";
import { RedisWordsCache } from "@/cache/redisWordsCache";

const vocabAssessmentRepository = new VocabAssessmentRepository(prisma);
const redisWordsCache = new RedisWordsCache(redisClient);
const vocabAssessmentService = new VocabAssessmentService(
  vocabAssessmentRepository,
  sessionService,
  vocabularyService,
  redisWordsCache
);
export const vocabAssessmentController = new VocabAssessmentController(vocabAssessmentService);
