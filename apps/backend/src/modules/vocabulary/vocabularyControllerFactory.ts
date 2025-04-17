import { VocabularyController } from "./vocabularyController";
import { VocabularyRepository } from "./vocabularyRepository";
import { VocabularyService } from "./vocabularyService";

export function createVocabularyController(): VocabularyController {
  const vocabularyRepository = new VocabularyRepository();
  const vocabularyService = new VocabularyService(vocabularyRepository);
  const vocabularyController = new VocabularyController(vocabularyService);
  return vocabularyController;
}
