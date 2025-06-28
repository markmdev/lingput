import { openai } from "@/services/openai";
import { prisma } from "@/services/prisma";
import supabase from "@/services/supabase";
import { AudioAssembler } from "./services/audioAssembler/audioAssembler";
import { StoryAudioStorageService } from "./services/audioAssembler/storyAudioStorageService";
import { TextToSpeechService } from "./services/audioAssembler/textToSpeechService";
import { LemmaAssembler } from "./services/lemmaAssembler/lemmaAssembler";
import { LemmatizationService } from "./services/lemmaAssembler/lemmatizationService";
import { StoryAssembler } from "./services/storyAssembler/storyAssembler";
import { StoryGeneratorService } from "./services/storyAssembler/storyGeneratorService";
import { TranslationService } from "./services/storyAssembler/translationService";
import { StoryController } from "./storyController";
import { StoryRepository } from "./storyRepository";
import { StoriesService } from "./storyService";
import { unknownWordService } from "../unknownWord/composition";
import { vocabularyService } from "../vocabulary/composition";
import redisClient from "@/services/redis";
import { RedisStoryCache } from "@/cache/redisStoryCache";

// Repositories
export const storyRepository = new StoryRepository(prisma, supabase);

// Services and Assemblers
export const translationService = new TranslationService(openai);
export const storyGeneratorService = new StoryGeneratorService(openai);
export const storyAssembler = new StoryAssembler(
  vocabularyService,
  storyGeneratorService,
  translationService,
  unknownWordService
);
export const lemmatizationService = new LemmatizationService(openai);
export const lemmaAssembler = new LemmaAssembler(lemmatizationService);
export const textToSpeechService = new TextToSpeechService(openai);
export const storyAudioStorageService = new StoryAudioStorageService(storyRepository);
export const audioAssembler = new AudioAssembler(storyAudioStorageService, textToSpeechService);

// Business logic
const redisStoryCache = new RedisStoryCache(redisClient);
export const storyService = new StoriesService(
  storyRepository,
  storyAssembler,
  lemmaAssembler,
  audioAssembler,
  redisStoryCache
);

// Controller
export const storyController = new StoryController(storyService, unknownWordService);
