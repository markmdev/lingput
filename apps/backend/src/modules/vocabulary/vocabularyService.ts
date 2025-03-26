import { PostgrestError } from "@supabase/supabase-js";
import { NewVocabulary, Vocabulary } from "./vocabulary.types";
import { VocabularyRepository } from "../../repositories/vocabularyRepository";

const vocabularyRepository = new VocabularyRepository();

export class VocabularyService {
  async getWords(): Promise<Vocabulary[]> {
    const { data, error } = await vocabularyRepository.getAllWordsFromDB();

    if (error) {
      throw new Error(error.message);
    } else if (!data) {
      throw new Error("Empty data from DB");
    } else {
      return data;
    }
  }

  async saveNewWord(word: NewVocabulary): Promise<PostgrestError | null> {
    const { error } = await vocabularyRepository.saveWordToDB(word);
    return error;
  }

  async deleteWord(wordId: number): Promise<void> {
    const { data, error } = await vocabularyRepository.deleteWord(wordId);
    if (error) {
      throw new Error(error.message);
    }
    if (!data || data.length === 0) {
      throw new Error(`Word with id ${wordId} not found`);
    }
  }
}
