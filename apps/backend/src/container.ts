import { createAuthMiddleware } from "./middlewares/authMiddleware";
import { buildAuthRouter } from "./modules/auth/authRoutes";
import { createAuthModule } from "./modules/auth/composition";
import { createJobsModule } from "./modules/jobs/composition";
import { createOnboardingModule } from "./modules/onboarding/composition";
import { createSessionModule } from "./modules/session/composition";
import { createStoryModule } from "./modules/story/composition";
import { TextToSpeechService } from "./modules/story/services/audioAssembler/textToSpeechService";
import { LemmatizationService } from "./modules/story/services/lemmaAssembler/lemmatizationService";
import { StoryGeneratorService } from "./modules/story/services/storyAssembler/storyGeneratorService";
import { TranslationService } from "./modules/story/services/storyAssembler/translationService";
import { createUnknownWordModule } from "./modules/unknownWord/composition";
import { createUserModule } from "./modules/user/composition";
import { createVocabAssessmentModule } from "./modules/vocabAssessment/composition";
import { createVocabularyModule } from "./modules/vocabulary/composition";
import { mainQueue } from "./services/jobQueue/queue";
import { openai } from "./services/openai";
import { prisma } from "./services/prisma";
import { redisClient } from "./services/redis/redisClient";
import supabase from "./services/supabase";

const storyGeneratorService = new StoryGeneratorService(openai);
const translationService = new TranslationService(openai);
const lemmatizationService = new LemmatizationService(openai);
const textToSpeechService = new TextToSpeechService(openai);

export const userModule = createUserModule({ prisma });

export const authModule = createAuthModule({
  redis: redisClient,
  userRepository: userModule.repository,
});

const authMiddleware = createAuthMiddleware(authModule.service);

export const authRouter = buildAuthRouter(authModule.controller, authMiddleware);
export const jobsModule = createJobsModule(authMiddleware);
export const sessionModule = createSessionModule({ redis: redisClient });

export const unknownWordModule = createUnknownWordModule({
  prisma,
  redis: redisClient,
  queue: mainQueue,
  authMiddleware,
});

export const vocabularyModule = createVocabularyModule({ prisma, authMiddleware });

export const storyModule = createStoryModule({
  prisma,
  storage: supabase,
  redis: redisClient,
  queue: mainQueue,
  authMiddleware,
  vocabularyService: vocabularyModule.service,
  storyGeneratorService,
  translationService,
  unknownWordService: unknownWordModule.service,
  lemmatizationService,
  textToSpeechService,
});

export const vocabAssessmentModule = createVocabAssessmentModule({
  prisma,
  redis: redisClient,
  authMiddleware,
  sessionService: sessionModule.service,
  vocabularyService: vocabularyModule.service,
});

export const onboardingModule = createOnboardingModule({
  prisma,
  authMiddleware,
});
