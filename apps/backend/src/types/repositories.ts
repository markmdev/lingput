import { PostgrestError } from "@supabase/supabase-js";
import { StorageError } from "@supabase/storage-js";

export type DBResponse<Type> = Promise<{
  data: Type | null;
  error: PostgrestError | null;
}>;

export type StorageResponse = Promise<{
  data: {
    id: string;
    path: string;
    fullPath: string;
  } | null;
  error: StorageError | null;
}>;
