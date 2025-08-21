import OpenAI from "openai";
import { StoryGeneratorService } from "./storyGeneratorService";
import { OpenAIError } from "@/errors/OpenAIError";

const storyMock = "Der Hund jagt die Katze.";

describe("StoryGeneratorService", () => {
  it("should return story when response is valid", async () => {
    const openaiMock = {
      responses: {
        create: jest.fn().mockResolvedValue({
          output_text: storyMock,
        }),
      },
    } as unknown as OpenAI;

    const generator = new StoryGeneratorService(openaiMock);

    const result = await generator.generateStory(["Hund", "Katze"], "Pets", "DE");
    expect(result).toBe(storyMock);
  });

  it("should throw if get an error from openai", async () => {
    const openaiMock = {
      responses: {
        create: jest.fn().mockRejectedValue(new Error("Unknown API Error")),
      },
    } as unknown as OpenAI;

    const generator = new StoryGeneratorService(openaiMock);

    const result = generator.generateStory(["Hund", "Katze"], "Pets", "DE");
    await expect(result).rejects.toBeInstanceOf(OpenAIError);
    await expect(result).rejects.toMatchObject({
      message: "Unable to generate a story",
      statusCode: 502,
      details: {
        subject: "Pets",
      },
    });
  });

  it("should throw if openai returns empty response", async () => {
    const openaiMock = {
      responses: {
        create: jest.fn().mockResolvedValue({
          output_text: null,
        }),
      },
    } as unknown as OpenAI;

    const generator = new StoryGeneratorService(openaiMock);

    const result = generator.generateStory(["Hund", "Katze"], "Pets", "DE");
    await expect(result).rejects.toBeInstanceOf(OpenAIError);
    await expect(result).rejects.toMatchObject({
      message: "Unable to generate a story",
      statusCode: 502,
      details: {
        targetLanguageWords: ["Hund", "Katze"],
        subject: "Pets",
      },
    });
  });
});
