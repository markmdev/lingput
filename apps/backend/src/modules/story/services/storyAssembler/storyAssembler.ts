import { VocabularyService } from "@/modules/vocabulary/vocabularyService";
import { StoryGeneratorService } from "./storyGeneratorService";
import { ChunkTranslation, TranslationService } from "./translationService";
import { UserVocabulary } from "@prisma/client";
import { UnknownWordService } from "@/modules/unknownWord/unknownWordService";

export class StoryAssembler {
  constructor(
    private vocabularyService: VocabularyService,
    private storyGeneratorService: StoryGeneratorService,
    private translationService: TranslationService,
    private unknownWordService: UnknownWordService
  ) {}

  async assemble(
    subject: string,
    userId: number
  ): Promise<{
    story: string;
    knownWords: UserVocabulary[];
    fullTranslation: string;
    translationChunks: ChunkTranslation[];
  }> {
    const vocabularyResult = await this.vocabularyService.getWords(userId);
    const unknownwordsResult = await this.unknownWordService.getUnknownWords();
    const knownWords = vocabularyResult.data;
    const knownWordsList = knownWords.map((word) => word.word);
    const unknownWordsList = unknownwordsResult.map((word) => word.word);
    const combinedWordsList = [...knownWordsList, ...unknownWordsList];
    const story = await this.storyGeneratorService.generateStory(combinedWordsList, subject);
    const cleanedStoryText = story.replace(/\n/g, " ").trim();

    const translationChunks = await this.translationService.translateChunks(cleanedStoryText);
    const fullTranslation = translationChunks.map((chunk) => chunk.translatedChunk).join(" ");

    return { story: cleanedStoryText, knownWords, fullTranslation, translationChunks };
  }
}
