import { Database } from "../../types/supabase";

export type UnknownWordDraft = Omit<
  Database["public"]["Tables"]["unknown_word"]["Insert"],
  "story_id"
>;

export type UnknownWord = UnknownWordDraft & { story_id: number };

export type UnknownWordDB = Database["public"]["Tables"]["unknown_word"]["Row"];

export function isUnknownWordDB(word: any): word is UnknownWordDB {
  return (
    typeof word === "object" &&
    typeof word.id === "number" &&
    typeof word.word === "string" &&
    typeof word.times_seen === "number" &&
    typeof word.story_id === "number"
  );
}
