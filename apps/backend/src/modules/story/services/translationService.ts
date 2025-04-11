import { OpenAIError } from "@/errors/OpenAIError";
import openai from "@/services/openaiClient";
import { Response as OpenAIResponse } from "openai/resources/responses/responses";

type ChunkTranslation = {
  chunk: string;
  translatedChunk: string;
};

type OpenAIChunkResponse = {
  chunks: ChunkTranslation[];
};

export class TranslationService {
  async translateChunks(story: string): Promise<ChunkTranslation[]> {
    let response: OpenAIResponse;
    try {
      response = await openai.responses.create({
        model: "gpt-4o",
        input: [
          {
            role: "system",
            content: `You are a helpful translator. Your task is to:
              1. Break down the given story into meaningful chunks (7-8 words. It can be either a full sentence, or just a part of a sentence)
              2. Translate each chunk to English
              3. Return the chunks in a structured format with both original and translated text
              
              Guidelines:
              - Keep chunks at a reasonable length (7-8 words)
              - Maintain the original meaning and tone
              - Preserve any cultural context
              - Ensure translations are natural and fluent in English
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
      throw new OpenAIError("Can't translate the text", { story }, error);
    }

    const content = response.output_text;
    if (!content) {
      throw new OpenAIError("Can't translate the text", { story });
    }

    const result = this.parseResponseContent(content);

    return result.chunks;
  }

  private parseResponseContent(content: string): OpenAIChunkResponse {
    let result: OpenAIChunkResponse;
    try {
      result = JSON.parse(content) as OpenAIChunkResponse;
    } catch (error) {
      throw new OpenAIError("Invalid response format, try again", { content }, error);
    }
    if (!result.chunks || !Array.isArray(result.chunks)) {
      throw new OpenAIError("Invalid response format, try again", { content, result });
    }
    return result;
  }
}
