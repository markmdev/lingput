import OpenAI from "openai";
import { OpenAIChunkResponse, TranslationService } from "./translationService";
import { OpenAIError } from "@/errors/OpenAIError";

const storyMock = "Der Hund jagt die Katze.";

const translatedChunksMock: OpenAIChunkResponse = {
  chunks: [
    {
      chunk: "Der Hund jagt die Katze.",
      translatedChunk: "The dog chases the cat.",
    },
  ],
};

const invalidResponseMock = {
  result: [
    {
      translation: "Translation",
    },
  ],
};

describe("TranslationService", () => {
  it("should return translated chunks when response is valid", async () => {
    const openaiMock = {
      responses: {
        create: jest.fn().mockResolvedValue({
          output_text: JSON.stringify(translatedChunksMock),
        }),
      },
    } as unknown as OpenAI;

    const translator = new TranslationService(openaiMock);

    const result = translator.translateChunks(storyMock, "EN");

    await expect(result).resolves.toEqual(translatedChunksMock.chunks);
  });

  it("should throw if response is not in valid format", async () => {
    const openaiMock = {
      responses: {
        create: jest.fn().mockResolvedValue({
          output_text: JSON.stringify(invalidResponseMock),
        }),
      },
    } as unknown as OpenAI;

    const translator = new TranslationService(openaiMock);

    const result = translator.translateChunks(storyMock, "EN");

    await expect(result).rejects.toBeInstanceOf(OpenAIError);
    await expect(result).rejects.toMatchObject({
      message: "Invalid response format, try again",
    });
  });

  it("should throw if got error from OpenAI", async () => {
    const openaiMock = {
      responses: {
        create: jest.fn().mockRejectedValue(new Error("Unknown Error")),
      },
    } as unknown as OpenAI;

    const translator = new TranslationService(openaiMock);

    const result = translator.translateChunks(storyMock, "EN");

    await expect(result).rejects.toBeInstanceOf(OpenAIError);
    await expect(result).rejects.toMatchObject({
      message: "Can't translate the text",
    });
  });
});
