import { BadRequestError } from "@/errors/BadRequestError";
import { UserVocabularyDTO, UserVocabularyWithUserIdDTO } from "./vocabulary.types";
import { VocabularyRepository } from "./vocabularyRepository";
import { UserVocabulary } from "@prisma/client";
import { NotFoundError } from "@/errors/NotFoundError";
import { Pagination } from "@/types/response.types";

export class VocabularyService {
  constructor(private vocabularyRepository: VocabularyRepository) {}
  async getWordByID(wordId: number, userId: number): Promise<UserVocabulary> {
    const word = await this.vocabularyRepository.getWordByID(wordId);
    if (!this.doesWordBelongToUser(word, userId)) {
      throw new NotFoundError("Word not found", null, { wordId, userId });
    }
    return word as UserVocabulary;
  }

  async getWords(
    userId: number,
    page?: number,
    pageSize?: number
  ): Promise<{ data: UserVocabulary[]; pagination?: Pagination }> {
    if (!page || !pageSize) {
      const words = await this.vocabularyRepository.getAllWordsWithoutPagination(userId);
      return { data: words };
    }
    const skip = (page - 1) * pageSize;
    const [words, totalItems] = await this.vocabularyRepository.getAllWords(userId, skip, pageSize);
    const totalPages = Math.ceil(totalItems / pageSize);
    return {
      data: words,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: pageSize,
      },
    };
  }

  async saveNewWord(word: UserVocabularyWithUserIdDTO): Promise<UserVocabulary> {
    return this.vocabularyRepository.saveWord(word);
  }

  async saveManyWords(words: UserVocabularyDTO[], userId: number): Promise<UserVocabulary[]> {
    if (!Array.isArray(words)) {
      throw new BadRequestError("The request body must be an array of objects.");
    }

    const allWordsValid = words.every((wordObj) => wordObj.word && wordObj.translation);
    if (!allWordsValid) {
      throw new BadRequestError("Each item must have a 'word' and a 'translation' property.");
    }

    const wordsWithUserId = this.attachUserIdToWords(words, userId);
    return this.vocabularyRepository.saveManyWords(wordsWithUserId);
  }

  async deleteWord(wordId: number, userId: number): Promise<UserVocabulary> {
    return this.vocabularyRepository.deleteWord(wordId, userId);
  }

  async updateWord(wordId: number, userId: number, wordData: Partial<UserVocabulary>) {
    // check if the user has the word
    await this.getWordByID(wordId, userId);

    return this.vocabularyRepository.updateWord(wordId, wordData);
  }

  private attachUserIdToWords(words: UserVocabularyDTO[], userId: number): UserVocabularyWithUserIdDTO[] {
    return words.map((word) => ({ ...word, userId }));
  }

  private doesWordBelongToUser(word: UserVocabulary | null, userId: number): boolean {
    return word !== null && word.userId === userId;
  }
}
