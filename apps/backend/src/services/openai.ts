import { EnvError } from "@/errors/EnvError";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new EnvError("Missing required environment variable: OPENAI_API_KEY");
}

export const openai = new OpenAI({
  apiKey: apiKey,
});
