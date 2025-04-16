import { BadRequestError } from "@/errors/BadRequestError";
import { UserVocabularyDTO, UserVocabularyWithUserIdDTO } from "./vocabulary.types";
import { VocabularyRepository } from "./vocabularyRepository";
import { UserVocabulary } from "@prisma/client";
import { NotFoundError } from "@/errors/NotFoundError";

const vocabularyRepository = new VocabularyRepository();

export class VocabularyService {
  async getWordByID(wordId: number, userId: number): Promise<UserVocabulary> {
    const word = await vocabularyRepository.getWordByID(wordId);
    if (!this.doesWordBelongToUser(word, userId)) {
      throw new NotFoundError("Word not found");
    }
    return word as UserVocabulary;
  }

  async getWords(userId: number): Promise<UserVocabulary[]> {
    return vocabularyRepository.getAllWords(userId);
  }

  async saveNewWord(word: UserVocabularyWithUserIdDTO): Promise<UserVocabulary> {
    return vocabularyRepository.saveWord(word);
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
    return vocabularyRepository.saveManyWords(wordsWithUserId);
  }

  async deleteWord(wordId: number, userId: number): Promise<UserVocabulary> {
    return vocabularyRepository.deleteWord(wordId, userId);
  }

  async updateWord(wordId: number, userId: number, wordData: Partial<UserVocabulary>) {
    // check if the user has the word
    await this.getWordByID(wordId, userId);

    return vocabularyRepository.updateWord(wordId, wordData);
  }

  private attachUserIdToWords(words: UserVocabularyDTO[], userId: number): UserVocabularyWithUserIdDTO[] {
    return words.map((word) => ({ ...word, userId }));
  }

  private doesWordBelongToUser(word: UserVocabulary | null, userId: number): boolean {
    return word !== null && word.userId === userId;
  }
}
