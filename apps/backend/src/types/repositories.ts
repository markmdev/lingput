import { PostgrestError } from "@supabase/supabase-js";

export type DBResponse<Type> = Promise<{
  data: Type | null;
  error: PostgrestError | null;
}>;
