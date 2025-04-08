import { UserVocabularyDTO } from "./vocabulary.types";
import { VocabularyRepository } from "./vocabularyRepository";
import { UserVocabulary } from "@prisma/client";

const vocabularyRepository = new VocabularyRepository();

export class VocabularyService {
  async getWords(): Promise<UserVocabularyDTO[]> {
    return vocabularyRepository.getAllWordsFromDB();
  }

  async saveNewWord(word: UserVocabularyDTO): Promise<UserVocabulary> {
    return vocabularyRepository.saveWordToDB(word);
  }

  async saveManyWords(words: UserVocabularyDTO[]): Promise<UserVocabulary[]> {
    return vocabularyRepository.saveManyWordsToDB(words);
  }

  async deleteWord(wordId: number): Promise<UserVocabulary> {
    return vocabularyRepository.deleteWord(wordId);
  }
}
