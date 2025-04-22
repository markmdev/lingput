import { prisma } from "@/services/prisma";
import { VocabularyController } from "./vocabularyController";
import { VocabularyRepository } from "./vocabularyRepository";
import { VocabularyService } from "./vocabularyService";

// Repositories
export const vocabularyRepository = new VocabularyRepository(prisma);

// Business logic
export const vocabularyService = new VocabularyService(vocabularyRepository);

// Controller
export const vocabularyController = new VocabularyController(vocabularyService);
