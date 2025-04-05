import { PostgrestError } from "@supabase/supabase-js";
import { StorageError } from "@supabase/storage-js";

export type DBResponse<Type> = Promise<{
  data: Type | null;
  error: PostgrestError | null;
}>;

export type StorageResponse<Type> = Promise<{
  data: Type | null;
  error: StorageError | null;
}>;
