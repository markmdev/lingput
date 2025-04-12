import { UserVocabulary } from "@prisma/client";
import { LemmatizationService } from "./lemmatizationService";
import { Lemma, LemmaWithTranslation } from "../../story.types";
import { CreateUnknownWordDTO } from "@/modules/unknownWord/unknownWord.types";
export class LemmaAssembler {
  constructor(private lemmatizationService: LemmatizationService) {}

  async assemble(story: string, knownWords: UserVocabulary[]): Promise<CreateUnknownWordDTO[]> {
    const storyLemmas = await this.lemmatizationService.lemmatize(story);
    const unknownLemmas = this.filterUnknownLemmas(storyLemmas, knownWords);
    const translatedUnknownLemmas = await this.lemmatizationService.translateLemmas(unknownLemmas);
    const unknownWords = this.mapUnknownLemmasToCreateUnknownWordDTO(translatedUnknownLemmas, unknownLemmas);

    return unknownWords;
  }

  private filterUnknownLemmas(storyLemmas: Lemma[], knownWords: UserVocabulary[]): Lemma[] {
    return storyLemmas.filter(
      (lemma: Lemma) => !knownWords.some((targetWord) => targetWord.word.toLowerCase() === lemma.lemma.toLowerCase())
    );
  }

  private mapUnknownLemmasToCreateUnknownWordDTO(
    translatedUnknownLemmas: LemmaWithTranslation[],
    originalLemmas: Lemma[]
  ): CreateUnknownWordDTO[] {
    return translatedUnknownLemmas.map((lemma) => ({
      word: lemma.lemma,
      translation: lemma.translation,
      article: originalLemmas.find((word) => word.lemma === lemma.lemma)?.article ?? null,
      exampleSentence: lemma.exampleSentence,
      exampleSentenceTranslation: lemma.exampleSentenceTranslation,
    }));
  }
}
