import { OpenAIError } from "@/errors/OpenAIError";
import { LanguageCode, LANGUAGES_MAP } from "@/utils/languages";
import OpenAI from "openai";
import { Response as OpenAIResponse } from "openai/resources/responses/responses";

export type ChunkTranslation = {
  chunk: string;
  translatedChunk: string;
};

export type OpenAIChunkResponse = {
  chunks: ChunkTranslation[];
};

export class TranslationService {
  constructor(private openai: OpenAI) {}
  async translateChunks(
    story: string,
    originalLanguageCode: LanguageCode
  ): Promise<ChunkTranslation[]> {
    let response: OpenAIResponse;
    try {
      response = await this.openai.responses.create({
        model: "gpt-5-mini",
        reasoning: { effort: "low" },
        input: [
          {
            role: "system",
            content: `You are a professional translator.  
            Your task is to break down the given story and translate it into ${LANGUAGES_MAP[originalLanguageCode]} according to these requirements:

            1. **Chunking**  
              - Split the text into meaningful chunks of about **7–8 words each**.  
              - A chunk can be a full sentence or a natural part of a sentence.  
              - Ensure chunks remain coherent and do not cut off in unnatural places.  

            2. **Translation**  
              - Translate each chunk into ${LANGUAGES_MAP[originalLanguageCode]}.  
              - The translation must preserve the **original meaning, tone, and style**.  
              - Ensure translations are **natural, fluent, and culturally appropriate**.  

            3. **Output format**  
              - Return results in a **structured list format**.  
              - For each chunk, show both the **original text** and the **translated text**.  

            4. **Guidelines**  
              - Do not exceed 8 words per chunk.  
              - Do not add or remove meaning.  
              - Keep style and register consistent with the original.  
              - Adapt idiomatic expressions or cultural references appropriately for ${LANGUAGES_MAP[originalLanguageCode]}.  
              `,
          },
          {
            role: "user",
            content: story,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "translation",
            schema: {
              type: "object",
              properties: {
                chunks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      chunk: { type: "string" },
                      translatedChunk: { type: "string" },
                    },
                    required: ["chunk", "translatedChunk"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["chunks"],
              additionalProperties: false,
            },
          },
        },
      });
    } catch (error) {
      throw new OpenAIError("Unable to translate the text", error, { story });
    }

    const content = response.output_text;
    if (!content) {
      throw new OpenAIError("Unable to translate the text", null, { story });
    }

    const result = this.parseResponseContent(content);

    return result.chunks;
  }

  private parseResponseContent(content: string): OpenAIChunkResponse {
    let result: OpenAIChunkResponse;
    try {
      result = JSON.parse(content) as OpenAIChunkResponse;
    } catch (error) {
      throw new OpenAIError("Invalid response format, try again", error, { content });
    }
    if (!result.chunks || !Array.isArray(result.chunks)) {
      throw new OpenAIError("Invalid response format, try again", null, { content, result });
    }
    return result;
  }
}
