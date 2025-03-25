import { Database } from "../../types/supabase";

export type NewVocabulary =
  Database["public"]["Tables"]["vocabulary"]["Insert"];
export type Vocabulary = Database["public"]["Tables"]["vocabulary"]["Row"];
