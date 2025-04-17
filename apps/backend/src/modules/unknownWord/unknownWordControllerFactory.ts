import { UnknownWordController } from "./unknownWordController";
import { UnknownWordRepository } from "./unknownWordRepository";
import { UnknownWordService } from "./unknownWordService";

export function createUnknownWordController(): UnknownWordController {
  const unknownWordRepository = new UnknownWordRepository();
  const unknownWordService = new UnknownWordService(unknownWordRepository);
  const unknownWordController = new UnknownWordController(unknownWordService);
  return unknownWordController;
}
