import { Base64 } from "@/types/types";
import OpenAI from "openai";

export class TextToSpeechService {
  constructor(private openai: OpenAI) {}
  async textToSpeech(text: string, isTargetLanguage: boolean): Promise<Base64> {
    const instructions = isTargetLanguage
      ? "Speak as you are voiceover a story for 'Comprehensible Input' method of learning. You must speak in a slow pace. Speak expressively. The language is German"
      : "Calm voice, narrator style. The language is English";
    const response = await this.openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "shimmer",
      input: text,
      instructions,
    });

    const buffer = await Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString("base64");
    return base64;
  }
}
