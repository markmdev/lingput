import { StoryAssembler } from "./storyAssembler";
import { VocabularyService } from "@/modules/vocabulary/vocabularyService";
import { StoryGeneratorService } from "./storyGeneratorService";
import { TranslationService, ChunkTranslation } from "./translationService";
import { UnknownWord, UserVocabulary } from "@prisma/client";
import { UnknownWordService } from "@/modules/unknownWord/unknownWordService";
import { Job } from "bullmq";
import { CustomError } from "@/errors/CustomError";
import { GENERATION_PHASES } from "../../generationPhases";

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

const unknownWordsMock: UnknownWord[] = [
  {
    userId: 1,
    id: 1,
    word: "jagen",
    translation: "to chase",
    article: null,
    exampleSentence: "Der Wolf jagt das Reh durch den Wald.",
    exampleSentenceTranslation: "The wolf chases the deer through the forest.",
    timesSeen: 1,
    status: "learning",
  },
];

const generatedStoryMock: string = "Der Hund jagt schnell die Katze.\n";

const translatedChunksMock: ChunkTranslation[] = [
  {
    chunk: "Der Hund jagt schnell die Katze.",
    translatedChunk: "The dog quickly chases the cat.",
  },
];

describe("StoryAssembler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("assembles story correctly", async () => {
    const vocabularyServiceMock = {
      getWords: jest.fn().mockResolvedValue({ data: wordsMock }),
    } as unknown as VocabularyService;

    const storyGeneratorServiceMock = {
      generateStory: jest.fn().mockResolvedValue(generatedStoryMock),
    } as unknown as StoryGeneratorService;

    const translationServiceMock = {
      translateChunks: jest.fn().mockResolvedValue(translatedChunksMock),
    } as unknown as TranslationService;

    const unknownWordServiceMock = {
      getUnknownWords: jest.fn().mockResolvedValue(unknownWordsMock),
    } as unknown as UnknownWordService;

    const assembler = new StoryAssembler(
      vocabularyServiceMock,
      storyGeneratorServiceMock,
      translationServiceMock,
      unknownWordServiceMock,
    );

    const expected = {
      story: "Der Hund jagt schnell die Katze.",
      knownWords: wordsMock,
      fullTranslation: "The dog quickly chases the cat.",
      translationChunks: translatedChunksMock,
    };

    const jobStub = { updateProgress: jest.fn() } as unknown as Job;
    const result = await assembler.assemble("Pets", 1, "DE", "EN", jobStub);
    expect(result).toEqual(expected);
    expect(vocabularyServiceMock.getWords).toHaveBeenCalledWith(1);
    expect(storyGeneratorServiceMock.generateStory).toHaveBeenCalledWith(
      ["Hund", "Katze", "jagen"],
      "Pets",
      "DE",
    );
    expect(translationServiceMock.translateChunks).toHaveBeenCalledWith(
      "Der Hund jagt schnell die Katze.",
      "EN",
    );
  });

  it("throws when vocabulary is empty", async () => {
    const vocabularyServiceMock = {
      getWords: jest.fn().mockResolvedValue({ data: [] }),
    } as unknown as VocabularyService;

    const storyGeneratorServiceMock = {
      generateStory: jest.fn(),
    } as unknown as StoryGeneratorService;

    const translationServiceMock = {
      translateChunks: jest.fn(),
    } as unknown as TranslationService;

    const unknownWordServiceMock = {
      getUnknownWords: jest.fn().mockResolvedValue([]),
    } as unknown as UnknownWordService;

    const assembler = new StoryAssembler(
      vocabularyServiceMock,
      storyGeneratorServiceMock,
      translationServiceMock,
      unknownWordServiceMock,
    );
    const jobStub = { updateProgress: jest.fn() } as unknown as Job;

    await expect(
      assembler.assemble("Pets", 1, "DE", "EN", jobStub),
    ).rejects.toBeInstanceOf(CustomError);
  });

  it("updates job progress across fetchingWords, generation, translation phases", async () => {
    const vocabularyServiceMock = {
      getWords: jest.fn().mockResolvedValue({ data: wordsMock }),
    } as unknown as VocabularyService;

    const storyGeneratorServiceMock = {
      generateStory: jest.fn().mockResolvedValue(generatedStoryMock),
    } as unknown as StoryGeneratorService;

    const translationServiceMock = {
      translateChunks: jest.fn().mockResolvedValue(translatedChunksMock),
    } as unknown as TranslationService;

    const unknownWordServiceMock = {
      getUnknownWords: jest.fn().mockResolvedValue(unknownWordsMock),
    } as unknown as UnknownWordService;

    const assembler = new StoryAssembler(
      vocabularyServiceMock,
      storyGeneratorServiceMock,
      translationServiceMock,
      unknownWordServiceMock,
    );

    const jobStub = { updateProgress: jest.fn() } as unknown as Job;
    await assembler.assemble("Pets", 1, "DE", "EN", jobStub);

    const totalSteps = Object.keys(GENERATION_PHASES).length;
    expect((jobStub as any).updateProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: GENERATION_PHASES.fetchingWords,
        totalSteps,
      }),
    );
    expect((jobStub as any).updateProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: GENERATION_PHASES.generation,
        totalSteps,
      }),
    );
    expect((jobStub as any).updateProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: GENERATION_PHASES.translation,
        totalSteps,
      }),
    );
  });
});
