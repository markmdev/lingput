import { StoryRepository } from "./storyRepository";
import { CreateStoryDTO, StoryWithUnknownWords } from "./story.types";
import { Story, UserVocabulary } from "@prisma/client";
import { CreateUnknownWordDTO } from "../unknownWord/unknownWord.types";
import { NotFoundError } from "@/errors/NotFoundError";
import { StoryAssembler } from "./services/storyAssembler/storyAssembler";
import { LemmaAssembler } from "./services/lemmaAssembler/lemmaAssembler";
import { AudioAssembler } from "./services/audioAssembler/audioAssembler";
import { LanguageCode } from "@/utils/languages";

export class StoriesService {
  constructor(
    private storyRepository: StoryRepository,
    private storyAssembler: StoryAssembler,
    private lemmaAssembler: LemmaAssembler,
    private audioAssembler: AudioAssembler
  ) {}

  public async generateFullStoryExperience(
    userId: number,
    languageCode: LanguageCode,
    originalLanguageCode: LanguageCode,
    subject: string = ""
  ): Promise<{ story: CreateStoryDTO; unknownWords: CreateUnknownWordDTO[]; knownWords: UserVocabulary[] }> {
    const { story, fullTranslation, translationChunks, knownWords } = await this.storyAssembler.assemble(
      subject,
      userId,
      languageCode,
      originalLanguageCode
    );
    const unknownWords = await this.lemmaAssembler.assemble(
      story,
      knownWords,
      userId,
      languageCode,
      originalLanguageCode
    );
    const audioUrl = await this.audioAssembler.assemble(
      translationChunks,
      unknownWords,
      languageCode,
      originalLanguageCode
    );

    return {
      story: {
        storyText: story,
        translationText: fullTranslation,
        audioUrl,
        userId,
      },
      unknownWords,
      knownWords,
    };
  }

  async saveStoryToDB(story: CreateStoryDTO): Promise<Story> {
    return await this.storyRepository.saveStoryToDB(story);
  }

  async getAllStories(userId: number): Promise<Story[]> {
    return await this.storyRepository.getAllStories(userId);
  }

  async connectUnknownWords(storyId: number, wordIds: { id: number }[]): Promise<StoryWithUnknownWords> {
    return await this.storyRepository.connectUnknownWords(storyId, wordIds);
  }

  async getStoryById(storyId: number, userId: number): Promise<Story> {
    const story = await this.storyRepository.getStoryById(storyId);
    if (!story) throw new NotFoundError("Story");
    if (story.userId !== userId) throw new NotFoundError("Story");
    return story;
  }
}
