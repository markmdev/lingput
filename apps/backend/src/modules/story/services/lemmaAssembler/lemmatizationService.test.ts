import OpenAI from "openai";
import { Lemma } from "../../story.types";
import { LemmatizationService, OpenAILemmasResponse } from "./lemmatizationService";

const lemmasMock: Lemma[] = [
  {
    lemma: "Hund",
    article: "Der",
    sentence: "Der Hund schläft in seinem Körbchen.",
  },
];

const translationMock: OpenAILemmasResponse = {
  lemmas: [
    {
      lemma: "Hund",
      translation: "Dog",
      exampleSentence: "Der Hund jagt die Katze.",
      exampleSentenceTranslation: "The dog chases the cat.",
    },
  ],
};

describe("LemmatizationService", () => {
  it("should return translated lemmas", async () => {
    const openaiMock = {
      responses: {
        create: jest.fn().mockResolvedValue({
          output_text: JSON.stringify(translationMock),
        }),
      },
    } as unknown as OpenAI;

    const lemmatizationService = new LemmatizationService(openaiMock);
    const result = lemmatizationService.translateLemmas(lemmasMock);

    await expect(result).resolves.toEqual(translationMock.lemmas);
  });
});
