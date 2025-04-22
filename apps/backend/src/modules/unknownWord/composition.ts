import { UnknownWordController } from "./unknownWordController";
import { UnknownWordRepository } from "./unknownWordRepository";
import { UnknownWordService } from "./unknownWordService";
import { prisma } from "@/services/prisma";

// Repositories
const unknownWordRepository = new UnknownWordRepository(prisma);

// Business logic
export const unknownWordService = new UnknownWordService(unknownWordRepository);

// Controller
export const unknownWordController = new UnknownWordController(unknownWordService);
