import { NewVocabulary, Vocabulary } from "./vocabulary.types";
import client from "../../services/supabase";
import { DBResponse } from "../../types/repositories";

export class VocabularyRepository {
  async saveWordToDB(word: NewVocabulary): DBResponse<null> {
    const { error } = await client.from("vocabulary").insert(word);

    return { data: null, error };
  }

  async saveManyWordsToDB(words: NewVocabulary[]): DBResponse<null> {
    const { error } = await client.from("vocabulary").insert(words);

    return { data: null, error };
  }

  async getAllWordsFromDB(): DBResponse<Vocabulary[]> {
    const { data, error } = await client.from("vocabulary").select();

    return { data, error };
  }

  async deleteWord(wordId: number): DBResponse<Vocabulary[]> {
    const { data, error } = await client
      .from("vocabulary")
      .delete()
      .eq("id", wordId)
      .select();
    return { data, error };
  }
}
