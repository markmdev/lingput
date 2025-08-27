import { VocabularyService } from "@/modules/vocabulary/vocabularyService";
import { StoryGeneratorService } from "./storyGeneratorService";
import { ChunkTranslation, TranslationService } from "./translationService";
import { UserVocabulary } from "@prisma/client";
import { UnknownWordService } from "@/modules/unknownWord/unknownWordService";
import { LanguageCode } from "@/utils/languages";
import { Job } from "bullmq";
import { GENERATION_PHASES } from "../../generationPhases";
import { CustomError } from "@/errors/CustomError";

export class StoryAssembler {
  constructor(
    private vocabularyService: VocabularyService,
    private storyGeneratorService: StoryGeneratorService,
    private translationService: TranslationService,
    private unknownWordService: UnknownWordService,
  ) {}

  async assemble(
    subject: string,
    userId: number,
    languageCode: LanguageCode,
    originalLanguageCode: LanguageCode,
    job: Job,
  ): Promise<{
    story: string;
    knownWords: UserVocabulary[];
    fullTranslation: string;
    translationChunks: ChunkTranslation[];
  }> {
    job.updateProgress({
      phase: GENERATION_PHASES["fetchingWords"],
      totalSteps: Object.keys(GENERATION_PHASES).length,
    });
    const vocabularyResult = await this.vocabularyService.getWords(userId);
    if (vocabularyResult.data.length === 0) {
      throw new CustomError(
        "User's vocabulary is empty. Vocab assessment is requred!",
        500,
        null,
      );
    }
    const unknownwordsResult =
      await this.unknownWordService.getUnknownWords(userId);
    const knownWords = vocabularyResult.data;
    const knownWordsList = knownWords.map((word) => word.word);
    const unknownWordsList = unknownwordsResult.map((word) => word.word);
    const combinedWordsList = [...knownWordsList, ...unknownWordsList];

    job.updateProgress({
      phase: GENERATION_PHASES["generation"],
      totalSteps: Object.keys(GENERATION_PHASES).length,
    });
    const story = await this.storyGeneratorService.generateStory(
      combinedWordsList,
      subject,
      languageCode,
    );
    const cleanedStoryText = story.replace(/\n/g, " ").trim();

    job.updateProgress({
      phase: GENERATION_PHASES["translation"],
      totalSteps: Object.keys(GENERATION_PHASES).length,
    });
    const translationChunks = await this.translationService.translateChunks(
      cleanedStoryText,
      originalLanguageCode,
    );
    const fullTranslation = translationChunks
      .map((chunk) => chunk.translatedChunk)
      .join(" ");

    return {
      story: cleanedStoryText,
      knownWords,
      fullTranslation,
      translationChunks,
    };
  }
}
