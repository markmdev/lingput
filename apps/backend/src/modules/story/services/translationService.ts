import openai from "../../../services/openaiClient";

export class TranslationService {
  async translateChunks(
    story: string
  ): Promise<{ chunk: string; translatedChunk: string }[]> {
    const response = await openai.responses.create({
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

    const content = response.output_text;
    if (!content) {
      throw new Error("No content returned from translation service");
    }

    const result = JSON.parse(content);
    if (!result.chunks || !Array.isArray(result.chunks)) {
      throw new Error("Invalid response format from translation service");
    }

    return result.chunks;
  }
}
