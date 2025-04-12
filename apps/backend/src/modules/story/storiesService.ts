import { StoriesRepository } from "./storiesRepository";
import { CreateStoryDTO, StoryWithUnknownWords } from "./story.types";
import { Story } from "@prisma/client";
import { CreateUnknownWordDTO } from "../unknownWord/unknownWord.types";
import { NotFoundError } from "@/errors/NotFoundError";
import { StoryAssembler } from "./services/storyAssembler/storyAssembler";
import { LemmaAssembler } from "./services/lemmaAssembler/lemmaAssembler";
import { AudioAssembler } from "./services/audioAssembler/audioAssembler";
const storiesRepository = new StoriesRepository();

export class StoriesService {
  constructor(
    private storyAssembler: StoryAssembler,
    private lemmaAssembler: LemmaAssembler,
    private audioAssembler: AudioAssembler
  ) {}

  public async generateFullStoryExperience(
    userId: number,
    subject: string = ""
  ): Promise<{ story: CreateStoryDTO; unknownWords: CreateUnknownWordDTO[] }> {
    const { story, fullTranslation, translationChunks, knownWords } = await this.storyAssembler.assemble(
      subject,
      userId
    );
    const unknownWords = await this.lemmaAssembler.assemble(story, knownWords);
    const audioUrl = await this.audioAssembler.assemble(translationChunks, unknownWords);

    return {
      story: {
        storyText: story,
        translationText: fullTranslation,
        audioUrl,
        userId,
      },
      unknownWords,
    };
  }

  async saveStoryToDB(story: CreateStoryDTO): Promise<Story> {
    return await storiesRepository.saveStoryToDB(story);
  }

  async getAllStories(userId: number): Promise<Story[]> {
    return await storiesRepository.getAllStories(userId);
  }

  async connectUnknownWords(storyId: number, wordIds: { id: number }[]): Promise<StoryWithUnknownWords> {
    return await storiesRepository.connectUnknownWords(storyId, wordIds);
  }

  async getStoryById(storyId: number, userId: number): Promise<Story> {
    const story = await storiesRepository.getStoryById(storyId);
    if (!story) throw new NotFoundError("Story");
    if (story.userId !== userId) throw new NotFoundError("Story");
    return story;
  }
}
