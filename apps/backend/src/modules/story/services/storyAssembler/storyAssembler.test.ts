import { StoryAssembler } from "./storyAssembler";
import { VocabularyService } from "@/modules/vocabulary/vocabularyService";
import { StoryGeneratorService } from "./storyGeneratorService";
import { TranslationService, ChunkTranslation } from "./translationService";
import { UserVocabulary } from "@prisma/client";

const wordsMock: UserVocabulary[] = [
  {
    id: 1,
    word: "Hund",
    translation: "Dog",
    article: "der",
    userId: 1,
  },
  {
    id: 2,
    word: "Katze",
    translation: "Cat",
    article: "die",
    userId: 1,
  },
];

const generatedStoryMock: string = "Der Hund jagt die Katze.\n";

const translatedChunksMock: ChunkTranslation[] = [
  {
    chunk: "Der Hund jagt die Katze.",
    translatedChunk: "The dog chases the cat.",
  },
];

describe("StoryAssembler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("assembles story correctly", async () => {
    // Mocks
    const vocabularyServiceMock = {
      getWords: jest.fn().mockResolvedValue(wordsMock),
    } as unknown as VocabularyService;

    const storyGeneratorServiceMock = {
      generateStory: jest.fn().mockResolvedValue(generatedStoryMock),
    } as unknown as StoryGeneratorService;

    const translationServiceMock = {
      translateChunks: jest.fn().mockResolvedValue(translatedChunksMock),
    } as unknown as TranslationService;

    const assembler = new StoryAssembler(vocabularyServiceMock, storyGeneratorServiceMock, translationServiceMock);

    const expected = {
      story: "Der Hund jagt die Katze.",
      knownWords: wordsMock,
      fullTranslation: "The dog chases the cat.",
      translationChunks: translatedChunksMock,
    };

    const result = await assembler.assemble("Pets", 1);
    expect(result).toEqual(expected);
    expect(vocabularyServiceMock.getWords).toHaveBeenCalledWith(1);
    expect(storyGeneratorServiceMock.generateStory).toHaveBeenCalledWith(["Hund", "Katze"], "Pets");
    expect(translationServiceMock.translateChunks).toHaveBeenCalledWith("Der Hund jagt die Katze.");
  });
});
