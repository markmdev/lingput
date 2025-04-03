import { Database } from "../../types/supabase";
import { UnknownWordDraft } from "../unknownWord/unknownWord.types";

export type Story = {
  story: string;
  translation: string;
  unknownWords: UnknownWordDraft[];
  audioUrl: string;
};

export type StoryDB = Database["public"]["Tables"]["story"]["Row"];
