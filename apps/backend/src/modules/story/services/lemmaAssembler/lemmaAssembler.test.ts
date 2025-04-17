import { Lemma, LemmaWithTranslation } from "../../story.types";
import { UserVocabulary } from "@prisma/client";
import { LemmaAssembler } from "./lemmaAssembler";
import { LemmatizationService } from "./lemmatizationService";
import { CreateUnknownWordDTO } from "@/modules/unknownWord/unknownWord.types";

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

    const result = await assembler.assemble(storyMock, knownWordsMock, 1);

    expect(result).toEqual(expectedResult);
  });
});
