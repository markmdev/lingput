import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { Database } from "../types/supabase";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseApiKey = process.env.SUPABASE_SERVICE_API_KEY;
if (!supabaseUrl || !supabaseApiKey) {
  throw new Error("Invalid supabase credentials");
}

const supabase = createClient<Database>(supabaseUrl, supabaseApiKey);

export default supabase;
