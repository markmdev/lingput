import OpenAI from "openai";
import { UnknownWordService } from "../unknownWord/unknownWordService";
import { VocabularyService } from "../vocabulary/vocabularyService";
import { AudioAssembler } from "./services/audioAssembler/audioAssembler";
import { StoryAudioStorageService } from "./services/audioAssembler/storyAudioStorageService";
import { TextToSpeechService } from "./services/audioAssembler/textToSpeechService";
import { LemmaAssembler } from "./services/lemmaAssembler/lemmaAssembler";
import { LemmatizationService } from "./services/lemmaAssembler/lemmatizationService";
import { StoryAssembler } from "./services/storyAssembler/storyAssembler";
import { StoryGeneratorService } from "./services/storyAssembler/storyGeneratorService";
import { TranslationService } from "./services/storyAssembler/translationService";
import StoriesController from "./storyController";
import { StoriesService } from "./storyService";
import { StoryRepository } from "./storyRepository";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

function createStoryAssembler(openai: OpenAI): StoryAssembler {
  const vocabularyService = new VocabularyService();
  const storyGeneratorService = new StoryGeneratorService(openai);
  const translationService = new TranslationService(openai);
  return new StoryAssembler(vocabularyService, storyGeneratorService, translationService);
}

function createLemmaAssembler(): LemmaAssembler {
  const lemmatizationService = new LemmatizationService();
  return new LemmaAssembler(lemmatizationService);
}

function createAudioAssembler(storyRepository: StoryRepository): AudioAssembler {
  const storyAudioStorageService = new StoryAudioStorageService(storyRepository);
  const textToSpeechService = new TextToSpeechService();
  return new AudioAssembler(storyAudioStorageService, textToSpeechService);
}

export function createStoriesController(): StoriesController {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const storyRepository = new StoryRepository();
  const storyAssembler = createStoryAssembler(openai);
  const lemmaAssembler = createLemmaAssembler();
  const audioAssembler = createAudioAssembler(storyRepository);

  const storiesService = new StoriesService(storyRepository, storyAssembler, lemmaAssembler, audioAssembler);
  const unknownWordService = new UnknownWordService();

  return new StoriesController(storiesService, unknownWordService);
}
