import { UserVocabulary } from "@prisma/client";
import { CreateUnknownWordDTO } from "../unknownWord/unknownWord.types";
import { AudioAssembler } from "./services/audioAssembler/audioAssembler";
import { LemmaAssembler } from "./services/lemmaAssembler/lemmaAssembler";
import { StoryAssembler } from "./services/storyAssembler/storyAssembler";
import { StoryRepository } from "./storyRepository";
import { StoriesService } from "./storyService";

const assembledStoryMock = {
  story: "Der Hund jagt die Katze.",
  knownWords: [
    {
      word: "Hund",
      translation: "Dog",
      article: "der",
      id: 1,
      userId: 1,
    },
  ],
  fullTranslation: "The dog chases the cat.",
  translationChunks: [
    {
      chunk: "Der Hund jagt die Katze.",
      translatedChunk: "The dog chases the cat.",
    },
  ],
};

const unknownWordsMock: CreateUnknownWordDTO[] = [
  {
    userId: 1,
    word: "Katze",
    translation: "Cat",
    article: "die",
    exampleSentence: "The cat is a small animal.",
    exampleSentenceTranslation: "Die Katze ist ein kleines Tier.",
  },
  {
    userId: 1,
    word: "jagen",
    translation: "to chase",
    article: null,
    exampleSentence: "The dog chases the cat.",
    exampleSentenceTranslation: "Der Hund jagt die Katze.",
  },
];

const knownWordsMock: UserVocabulary[] = [
  {
    id: 1,
    userId: 1,
    word: "Hund",
    translation: "Dog",
    article: "der",
  },
];

describe("StoryService", () => {
  it("should generate a story", async () => {
    const storyRepositoryMock = {} as unknown as StoryRepository;
    const storyAssemblerMock = {
      assemble: jest.fn().mockResolvedValue(assembledStoryMock),
    } as unknown as StoryAssembler;
    const lemmaAssemblerMock = {
      assemble: jest.fn().mockResolvedValue(unknownWordsMock),
    } as unknown as LemmaAssembler;
    const audioAssemblerMock = {
      assemble: jest.fn().mockResolvedValue("audioUrl"),
    } as unknown as AudioAssembler;

    const expectedResult = {
      story: {
        storyText: "Der Hund jagt die Katze.",
        translationText: "The dog chases the cat.",
        audioUrl: "audioUrl",
        userId: 1,
      },
      unknownWords: unknownWordsMock,
      knownWords: knownWordsMock,
    };

    const storyService = new StoriesService(
      storyRepositoryMock,
      storyAssemblerMock,
      lemmaAssemblerMock,
      audioAssemblerMock
    );
    const result = await storyService.generateFullStoryExperience(1, "DE", "EN", "Pets");
    expect(result).toEqual(expectedResult);
  });
});
