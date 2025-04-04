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

  async markAsLearned(wordId: number) {
    const { data, error } = await client
      .from("unknown_word")
      .update({ status: "learned" })
      .eq("id", wordId);
    return { data, error };
  }

  async markAsLearning(wordId: number) {
    const { data, error } = await client
      .from("unknown_word")
      .update({ status: "learning" })
      .eq("id", wordId);
    return { data, error };
  }

  async getUnknownWords(): Promise<DBResponse<UnknownWordDB[]>> {
    const { data, error } = await client.from("unknown_word").select("*");
    return { data, error };
  }

  async updateTimesSeen(
    wordId: number,
    timesSeen: number
  ): Promise<DBResponse<UnknownWordDB>> {
    const { data, error } = await client
      .from("unknown_word")
      .update({ times_seen: timesSeen })
      .eq("id", wordId)
      .select()
      .single();
    return { data, error };
  }
}
