import { prisma } from "@/services/prisma";
import { VocabAssessmentController } from "./vocabAssessmentController";
import { VocabAssessmentRepository } from "./vocabAssessmentRepository";
import { VocabAssessmentService } from "./vocabAssessmentService";
import { sessionService } from "../session/composition";
import { vocabularyService } from "../vocabulary/composition";
import redisClient from "@/services/redis";

const vocabAssessmentRepository = new VocabAssessmentRepository(prisma, redisClient);
const vocabAssessmentService = new VocabAssessmentService(
  vocabAssessmentRepository,
  sessionService,
  vocabularyService
);
export const vocabAssessmentController = new VocabAssessmentController(vocabAssessmentService);
