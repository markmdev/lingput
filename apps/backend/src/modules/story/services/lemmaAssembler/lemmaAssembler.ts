import { UserVocabulary } from "@prisma/client";
import { LemmatizationService } from "./lemmatizationService";
import { Lemma, LemmaWithTranslation } from "../../story.types";
import { CreateUnknownWordDTO } from "@/modules/unknownWord/unknownWord.types";
import { LanguageCode } from "@/utils/languages";
import { Job } from "bullmq";
import { GENERATION_PHASES } from "../../generationPhases";

export class LemmaAssembler {
  constructor(private lemmatizationService: LemmatizationService) {}

  async assemble(
    story: string,
    knownWords: UserVocabulary[],
    userId: number,
    languageCode: LanguageCode,
    originalLanguageCode: LanguageCode,
    job: Job
  ): Promise<CreateUnknownWordDTO[]> {
    job.updateProgress({ phase: GENERATION_PHASES["lemmatization"] });
    const storyLemmas = await this.lemmatizationService.lemmatize(story);
    const unknownLemmas = this.filterUnknownLemmas(storyLemmas, knownWords);
    job.updateProgress({ phase: GENERATION_PHASES["creatingExamples"] });
    const translatedUnknownLemmas = await this.lemmatizationService.translateLemmas(
      unknownLemmas,
      languageCode,
      originalLanguageCode
    );
    const unknownWords = this.mapUnknownLemmasToCreateUnknownWordDTO(
      translatedUnknownLemmas,
      unknownLemmas,
      userId
    );

    return unknownWords;
  }

  private filterUnknownLemmas(storyLemmas: Lemma[], knownWords: UserVocabulary[]): Lemma[] {
    return storyLemmas.filter(
      (lemma: Lemma) =>
        !knownWords.some(
          (targetWord) => targetWord.word.toLowerCase() === lemma.lemma.toLowerCase()
        )
    );
  }

  private mapUnknownLemmasToCreateUnknownWordDTO(
    translatedUnknownLemmas: LemmaWithTranslation[],
    originalLemmas: Lemma[],
    userId: number
  ): CreateUnknownWordDTO[] {
    return translatedUnknownLemmas.map((lemma) => ({
      userId: userId,
      word: lemma.lemma,
      translation: lemma.translation,
      article: originalLemmas.find((word) => word.lemma === lemma.lemma)?.article ?? null,
      exampleSentence: lemma.exampleSentence,
      exampleSentenceTranslation: lemma.exampleSentenceTranslation,
    }));
  }
}
