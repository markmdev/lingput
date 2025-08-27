import { Lemma, LemmaWithTranslation } from "../../story.types";
import { UserVocabulary } from "@prisma/client";
import { LemmaAssembler } from "./lemmaAssembler";
import { LemmatizationService } from "./lemmatizationService";
import { CreateUnknownWordDTO } from "@/modules/unknownWord/unknownWord.types";
import { Job } from "bullmq";
import { GENERATION_PHASES } from "../../generationPhases";

const storyMock = "Der Hund jagt die Katze.";

const knownWordsMock: UserVocabulary[] = [
  {
    id: 1,
    word: "Hund",
    translation: "Dog",
    article: "der",
    userId: 1,
  },
];

const lemmasMock: Lemma[] = [
  {
    lemma: "Hund",
    article: "der",
    sentence: "Der Hund jagt die Katze.",
  },
  {
    lemma: "Katze",
    article: "die",
    sentence: "Der Hund jagt die Katze.",
  },
  {
    lemma: "jagen",
    article: null,
    sentence: "Der Hund jagt die Katze.",
  },
];

const translatedLemmas: LemmaWithTranslation[] = [
  {
    lemma: "Katze",
    translation: "Cat",
    exampleSentence: "Der Hund jagt die Katze.",
    exampleSentenceTranslation: "The dog chases the cat.",
  },
  {
    lemma: "jagen",
    translation: "to chase",
    exampleSentence: "Der Hund jagt die Katze.",
    exampleSentenceTranslation: "The dog chases the cat.",
  },
];

describe("LemmaAssember", () => {
  it("returns a list of unknown words from a story", async () => {
    const lemmatizationServiceMock = {
      lemmatize: jest.fn().mockResolvedValue(lemmasMock),
      translateLemmas: jest.fn().mockResolvedValue(translatedLemmas),
    } as unknown as LemmatizationService;

    const assembler = new LemmaAssembler(lemmatizationServiceMock);

    const expectedResult: CreateUnknownWordDTO[] = [
      {
        userId: 1,
        word: "Katze",
        translation: "Cat",
        article: "die",
        exampleSentence: "Der Hund jagt die Katze.",
        exampleSentenceTranslation: "The dog chases the cat.",
      },
      {
        userId: 1,
        word: "jagen",
        translation: "to chase",
        article: null,
        exampleSentence: "Der Hund jagt die Katze.",
        exampleSentenceTranslation: "The dog chases the cat.",
      },
    ];

    const jobStub = { updateProgress: jest.fn() } as unknown as Job;
    const result = await assembler.assemble(
      storyMock,
      knownWordsMock,
      1,
      "DE",
      "EN",
      jobStub,
    );

    expect(result).toEqual(expectedResult);
  });

  it("filters known words case-insensitively", async () => {
    const lemmatizationServiceMock = {
      lemmatize: jest.fn().mockResolvedValue([
        { lemma: "hund", article: "der", sentence: "..." },
        { lemma: "Katze", article: "die", sentence: "..." },
      ]),
      translateLemmas: jest.fn().mockResolvedValue([
        {
          lemma: "Katze",
          translation: "Cat",
          exampleSentence: "...",
          exampleSentenceTranslation: "...",
        },
      ]),
    } as unknown as LemmatizationService;

    const assembler = new LemmaAssembler(lemmatizationServiceMock);
    const jobStub = { updateProgress: jest.fn() } as unknown as Job;

    const result = await assembler.assemble(
      "story",
      [{ ...knownWordsMock[0], word: "Hund" }],
      1,
      "DE",
      "EN",
      jobStub,
    );

    expect(result).toEqual([expect.objectContaining({ word: "Katze" })]);
  });

  it("updates job progress for lemmatization and creatingExamples phases", async () => {
    const lemmatizationServiceMock = {
      lemmatize: jest.fn().mockResolvedValue(lemmasMock),
      translateLemmas: jest.fn().mockResolvedValue(translatedLemmas),
    } as unknown as LemmatizationService;

    const assembler = new LemmaAssembler(lemmatizationServiceMock);
    const jobStub = { updateProgress: jest.fn() } as unknown as Job;

    await assembler.assemble(storyMock, knownWordsMock, 1, "DE", "EN", jobStub);

    const totalSteps = Object.keys(GENERATION_PHASES).length;
    expect((jobStub as any).updateProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: GENERATION_PHASES.lemmatization,
        totalSteps,
      }),
    );
    expect((jobStub as any).updateProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: GENERATION_PHASES.creatingExamples,
        totalSteps,
      }),
    );
  });
});
