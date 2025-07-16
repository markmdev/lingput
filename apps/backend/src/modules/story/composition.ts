import { RedisStoryCache } from "@/cache/redisStoryCache";
import { StoryController } from "./storyController";
import { StoriesService } from "./storyService";
import { StoryRepository } from "./storyRepository";
import { PrismaClient } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { AppRedisClient } from "@/services/redis/redisClient";
import { StoryAssembler } from "./services/storyAssembler/storyAssembler";
import { VocabularyService } from "../vocabulary/vocabularyService";
import { StoryGeneratorService } from "./services/storyAssembler/storyGeneratorService";
import { TranslationService } from "./services/storyAssembler/translationService";
import { UnknownWordService } from "../unknownWord/unknownWordService";
import { LemmaAssembler } from "./services/lemmaAssembler/lemmaAssembler";
import { LemmatizationService } from "./services/lemmaAssembler/lemmatizationService";
import { AudioAssembler } from "./services/audioAssembler/audioAssembler";
import { StoryAudioStorageService } from "./services/audioAssembler/storyAudioStorageService";
import { TextToSpeechService } from "./services/audioAssembler/textToSpeechService";
import { buildStoryRouter } from "./storyRoutes";
import { NextFunction, Request, Response } from "express";

export function createStoryModule(deps: {
  prisma: PrismaClient;
  storage: SupabaseClient;
  redis: AppRedisClient;
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
  vocabularyService: VocabularyService;
  storyGeneratorService: StoryGeneratorService;
  translationService: TranslationService;
  unknownWordService: UnknownWordService;
  lemmatizationService: LemmatizationService;
  textToSpeechService: TextToSpeechService;
}) {
  const repository = new StoryRepository(deps.prisma, deps.storage);
  const cache = new RedisStoryCache(deps.redis);
  const storyAssembler = new StoryAssembler(
    deps.vocabularyService,
    deps.storyGeneratorService,
    deps.translationService,
    deps.unknownWordService
  );
  const lemmaAssembler = new LemmaAssembler(deps.lemmatizationService);
  const storyAudioStorageService = new StoryAudioStorageService(repository);
  const audioAssembler = new AudioAssembler(storyAudioStorageService, deps.textToSpeechService);
  const service = new StoriesService(
    repository,
    storyAssembler,
    lemmaAssembler,
    audioAssembler,
    cache
  );
  const controller = new StoryController(service, deps.unknownWordService);
  return { controller, router: buildStoryRouter(controller, deps.authMiddleware) };
}
