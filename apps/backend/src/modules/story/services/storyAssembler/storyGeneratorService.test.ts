import OpenAI from "openai";
import { StoryGeneratorService } from "./storyGeneratorService";
import { OpenAIError } from "@/errors/OpenAIError";

const storyMock = "Der Hund jagt die Katze.";

describe("StoryGeneratorService", () => {
  it("should return story when response is valid", async () => {
    const openaiMock = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: storyMock,
                },
              },
            ],
          }),
        },
      },
    } as unknown as OpenAI;

    const generator = new StoryGeneratorService(openaiMock);

    const result = await generator.generateStory(["Hund", "Katze"], "Pets");
    expect(result).toBe(storyMock);
  });

  it("should throw if get an error from openai", async () => {
    const openaiMock = {
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error("Unknown API Error")),
        },
      },
    } as unknown as OpenAI;

    const generator = new StoryGeneratorService(openaiMock);

    const result = generator.generateStory(["Hund", "Katze"], "Pets");
    await expect(result).rejects.toBeInstanceOf(OpenAIError);
    await expect(result).rejects.toMatchObject({
      message: "Can't generate a story",
      statusCode: 502,
      details: {
        targetLanguageWords: ["Hund", "Katze"],
        subject: "Pets",
      },
      originalError: new Error("Unknown API Error"),
    });
  });

  it("should throw if openai returns empty response", async () => {
    const openaiMock = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: null,
                },
              },
            ],
          }),
        },
      },
    } as unknown as OpenAI;

    const generator = new StoryGeneratorService(openaiMock);

    const result = generator.generateStory(["Hund", "Katze"], "Pets");
    await expect(result).rejects.toBeInstanceOf(OpenAIError);
    await expect(result).rejects.toMatchObject({
      message: "Can't generate a story",
      statusCode: 502,
      details: {
        targetLanguageWords: ["Hund", "Katze"],
        subject: "Pets",
      },
    });
  });
});
