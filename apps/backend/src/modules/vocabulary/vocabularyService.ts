import { BadRequestError } from "@/errors/BadRequestError";
import { UserVocabularyDTO, UserVocabularyWithUserIdDTO } from "./vocabulary.types";
import { VocabularyRepository } from "./vocabularyRepository";
import { UserVocabulary } from "@prisma/client";

const vocabularyRepository = new VocabularyRepository();

export class VocabularyService {
  async getWords(userId: number): Promise<UserVocabulary[]> {
    return vocabularyRepository.getAllWordsFromDB(userId);
  }

  async saveNewWord(word: UserVocabularyWithUserIdDTO): Promise<UserVocabulary> {
    return vocabularyRepository.saveWordToDB(word);
  }

  async saveManyWords(words: UserVocabularyDTO[], userId: number): Promise<UserVocabulary[]> {
    if (!Array.isArray(words)) {
      throw new BadRequestError("The request body must be an array of objects.");
    }

    const allWordsValid = words.every((wordObj) => wordObj.word && wordObj.translation);
    if (!allWordsValid) {
      throw new BadRequestError("Each word must have a 'word' and 'translation' property.");
    }

    const wordsWithUserId = this.attachUserIdToWords(words, userId);
    return vocabularyRepository.saveManyWordsToDB(wordsWithUserId);
  }

  async deleteWord(wordId: number, userId: number): Promise<UserVocabulary> {
    return vocabularyRepository.deleteWord(wordId, userId);
  }

  private attachUserIdToWords(words: UserVocabularyDTO[], userId: number): UserVocabularyWithUserIdDTO[] {
    return words.map((word) => ({ ...word, userId }));
  }
}
