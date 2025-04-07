import { UserVocabularyDTO } from "./vocabulary.types";
import { VocabularyRepository } from "./vocabularyRepository";
import { UserVocabulary } from "@prisma/client";

const vocabularyRepository = new VocabularyRepository();

export class VocabularyService {
  async getWords(): Promise<UserVocabularyDTO[]> {
    const words = await vocabularyRepository.getAllWordsFromDB();

    return words;
  }

  async saveNewWord(word: UserVocabularyDTO): Promise<UserVocabulary> {
    const newWord = await vocabularyRepository.saveWordToDB(word);
    return newWord;
  }

  async saveManyWords(words: UserVocabularyDTO[]): Promise<UserVocabulary[]> {
    const newWords = await vocabularyRepository.saveManyWordsToDB(words);
    return newWords;
  }

  async deleteWord(wordId: number): Promise<UserVocabulary> {
    const deletedWord = await vocabularyRepository.deleteWord(wordId);
    return deletedWord;
  }
}
