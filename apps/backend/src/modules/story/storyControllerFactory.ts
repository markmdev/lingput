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
import { VocabularyRepository } from "../vocabulary/vocabularyRepository";
import { UnknownWordRepository } from "../unknownWord/unknownWordRepository";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

function createStoryAssembler(
  openai: OpenAI,
  vocabularyRepository: VocabularyRepository,
  unknownWordService: UnknownWordService
): StoryAssembler {
  const vocabularyService = new VocabularyService(vocabularyRepository);
  const storyGeneratorService = new StoryGeneratorService(openai);
  const translationService = new TranslationService(openai);
  return new StoryAssembler(vocabularyService, storyGeneratorService, translationService, unknownWordService);
}

function createLemmaAssembler(openai: OpenAI): LemmaAssembler {
  const lemmatizationService = new LemmatizationService(openai);
  return new LemmaAssembler(lemmatizationService);
}

function createAudioAssembler(storyRepository: StoryRepository, openai: OpenAI): AudioAssembler {
  const storyAudioStorageService = new StoryAudioStorageService(storyRepository);
  const textToSpeechService = new TextToSpeechService(openai);
  return new AudioAssembler(storyAudioStorageService, textToSpeechService);
}

export function createStoriesController(): StoriesController {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const storyRepository = new StoryRepository();
  const vocabularyRepository = new VocabularyRepository();
  const unknownWordRepository = new UnknownWordRepository();
  const unknownWordService = new UnknownWordService(unknownWordRepository);
  const storyAssembler = createStoryAssembler(openai, vocabularyRepository, unknownWordService);
  const lemmaAssembler = createLemmaAssembler(openai);
  const audioAssembler = createAudioAssembler(storyRepository, openai);

  const storiesService = new StoriesService(storyRepository, storyAssembler, lemmaAssembler, audioAssembler);

  return new StoriesController(storiesService, unknownWordService);
}
