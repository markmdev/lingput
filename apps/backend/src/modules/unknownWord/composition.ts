import { UnknownWordController } from "./unknownWordController";
import { UnknownWordRepository } from "./unknownWordRepository";
import { UnknownWordService } from "./unknownWordService";

// Repositories
const unknownWordRepository = new UnknownWordRepository();

// Business logic
export const unknownWordService = new UnknownWordService(unknownWordRepository);

// Controller
export const unknownWordController = new UnknownWordController(unknownWordService);
