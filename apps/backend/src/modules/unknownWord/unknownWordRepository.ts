import client from "../../services/supabase";
import { DBResponse } from "../../types/repositories";
import { UnknownWord, UnknownWordDB } from "./unknownWord.types";

export class UnknownWordRepository {
  async saveUnknownWords(
    unknownWords: UnknownWord[]
  ): DBResponse<UnknownWordDB[]> {
    const { data, error } = await client
      .from("unknown_word")
      .insert(unknownWords)
      .select();
    return { data, error };
  }
}
