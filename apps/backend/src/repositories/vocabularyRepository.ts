import { PostgrestError } from "@supabase/supabase-js";
import {
  NewVocabulary,
  Vocabulary,
} from "../modules/vocabulary/vocabulary.types";
import client from "../services/supabase";
import { DBResponse } from "../types/repositories";

async function saveWordToDB(word: NewVocabulary): DBResponse<null> {
  const { error } = await client.from("vocabulary").insert(word);

  return { data: null, error };
}

async function getAllWordsFromDB(): DBResponse<Vocabulary[]> {
  const { data, error } = await client.from("vocabulary").select();

  return { data, error };
}

export { saveWordToDB, getAllWordsFromDB };
