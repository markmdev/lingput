import { VocabularyService } from "@/modules/vocabulary/vocabularyService";
import { StoryGeneratorService } from "./storyGeneratorService";
import { ChunkTranslation, TranslationService } from "./translationService";
import { UserVocabulary } from "@prisma/client";

export class StoryAssembler {
  constructor(
    private vocabularyService: VocabularyService,
    private storyGeneratorService: StoryGeneratorService,
    private translationService: TranslationService
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
    const knownWords = await this.vocabularyService.getWords(userId);
    const knownWordsList = knownWords.map((word) => word.word);
    const story = await this.storyGeneratorService.generateStory(knownWordsList, subject);
    const cleanedStoryText = story.replace(/\n/g, "");

    const translationChunks = await this.translationService.translateChunks(cleanedStoryText);
    const fullTranslation = translationChunks.map((chunk) => chunk.translatedChunk).join(" ");

    return { story: cleanedStoryText, knownWords, fullTranslation, translationChunks };
  }
}
