import { Database } from "../../types/supabase";

export type UnknownWordDraft = Omit<
  Database["public"]["Tables"]["unknown_word"]["Insert"],
  "story_id"
>;

export type UnknownWord = UnknownWordDraft & { story_id: number };

export type UnknownWordDB = Database["public"]["Tables"]["unknown_word"]["Row"];
