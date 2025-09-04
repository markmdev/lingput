import { VocabAssessmentError } from "@/errors/VocabAssessmentError";
import { SessionService } from "../session/sessionService";
import { VocabAssessmentRepository } from "./vocabAssessmentRepository";
import { WordRanking } from "@prisma/client";
import { VocabularyService } from "../vocabulary/vocabularyService";
import { UserVocabularyDTO } from "../vocabulary/vocabulary.types";
import { RedisWordsCache } from "@/cache/redisWordsCache";
import { Session } from "../session/sessionRepository";
import { logger } from "@/utils/logger";

const WORDS_PER_BATCH = 15;
const KNOWLEDGE_THRESHOLD = 0.67;
const MIN_RANGE_FOR_ESTIMATION = 100;

interface SessionState {
  min: number;
  max: number;
  mid: number;
  wordsToReview: WordRanking[];
  range: number;
  isLastStep: boolean;
  step: number;
  vocabularySize?: number;
}

export class VocabAssessmentService {
  constructor(
    private vocabAssessmentRepository: VocabAssessmentRepository,
    private sessionService: SessionService,
    private vocabularyService: VocabularyService,
    private redisWordsCache: RedisWordsCache,
  ) {}

  async skipAssessment(
    userId: number,
    sourceLanguage: string,
    targetLanguage: string,
  ) {
    const words = await this.getWordRanking(sourceLanguage, targetLanguage);
    const knownVocabulary = words.slice(0, 50);
    const vocabularyDTO: UserVocabularyDTO[] = knownVocabulary.map((word) => ({
      word: word.word,
      translation: word.translation,
      article: null,
    }));
    await this.vocabularyService.saveManyWords(vocabularyDTO, userId);
  }

  async startAssessment(
    userId: number,
    sourceLanguage: string,
    targetLanguage: string,
  ) {
    let words: WordRanking[] | null;
    words = await this.redisWordsCache.getWords(sourceLanguage, targetLanguage);
    if (!words) {
      words = await this.vocabAssessmentRepository.getWords(
        sourceLanguage,
        targetLanguage,
      );
      try {
        await this.redisWordsCache.saveWords(
          sourceLanguage,
          targetLanguage,
          words,
        );
      } catch (error) {
        logger.error("[cache] Failed to save words in Redis", error);
      }
    }

    const max = words.length - 1;
    const min = 0;
    const mid = (max + min) / 2;
    const wordsToReview = words.slice(
      mid - WORDS_PER_BATCH / 2,
      mid + WORDS_PER_BATCH / 2,
    );
    const state: SessionState = {
      min: 1,
      max: words.length,
      mid,
      wordsToReview,
      range: WORDS_PER_BATCH,
      isLastStep: false,
      step: 1,
    };
    const session = await this.sessionService.createSession(userId, state);
    return {
      sessionId: session.sessionUUID,
      status: "active",
      wordsToReview,
      lastStep: state.isLastStep,
      step: state.step,
    };
  }

  async continueAssessment(
    userId: number,
    sessionUUID: string,
    answer: Record<string, boolean> | undefined,
    sourceLanguage = "en",
    targetLanguage = "de",
  ) {
    const session = await this.sessionService.getSession(userId, sessionUUID);
    if (!session?.state)
      throw new VocabAssessmentError(
        "Session not found or invalid state",
        null,
        { session },
      );

    const state = session.state as unknown as SessionState;
    if (!this.isValidSessionState(state)) {
      throw new VocabAssessmentError("Invalid session state format", null, {
        state,
      });
    }

    if (!answer) {
      return {
        sessionId: sessionUUID,
        status: session.status,
        wordsToReview: state.wordsToReview,
        lastStep: state.isLastStep,
        step: state.step,
        vocabularySize: state.vocabularySize,
      };
    }

    const words = await this.getWordRanking(sourceLanguage, targetLanguage);

    const wordsToReview = state.wordsToReview;
    const result = this.checkAnswer(answer, wordsToReview);

    if (result >= KNOWLEDGE_THRESHOLD) {
      state.min = state.mid;
    } else {
      state.max = state.mid;
    }
    state.mid = Math.floor((state.max + state.min) / 2);
    state.step++;

    if (state.isLastStep) {
      return this.finishAssessment(userId, state, words, sessionUUID, session);
    } else {
      if (state.max - state.min < MIN_RANGE_FOR_ESTIMATION) {
        state.isLastStep = true;
      }

      state.wordsToReview = words.slice(
        state.mid - WORDS_PER_BATCH / 2,
        state.mid + WORDS_PER_BATCH / 2,
      );
      await this.sessionService.updateSessionState(userId, sessionUUID, state);
      return {
        sessionId: sessionUUID,
        status: "active",
        wordsToReview: state.wordsToReview,
        lastStep: state.isLastStep,
        step: state.step,
      };
    }
  }

  private async finishAssessment(
    userId: number,
    state: SessionState,
    words: WordRanking[],
    sessionUUID: string,
    session: Session,
  ) {
    const knownVocabularyCount = state.mid;
    const knownVocabulary = words.slice(0, knownVocabularyCount);
    await this.sessionService.completeSession(userId, sessionUUID);
    const vocabularyDTO: UserVocabularyDTO[] = knownVocabulary.map((word) => ({
      word: word.word,
      translation: word.translation,
      article: null,
    }));
    await this.vocabularyService.saveManyWords(vocabularyDTO, session.userId);
    state.wordsToReview = [];
    state.range = 0;
    state.vocabularySize = vocabularyDTO.length;
    await this.sessionService.updateSessionState(userId, sessionUUID, state);
    return {
      sessionId: sessionUUID,
      status: "completed",
      vocabularySize: vocabularyDTO.length,
    };
  }

  private async getWordRanking(
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<WordRanking[]> {
    let words: WordRanking[] | null;
    words = await this.redisWordsCache.getWords(sourceLanguage, targetLanguage);
    if (!words) {
      words = await this.vocabAssessmentRepository.getWords(
        sourceLanguage,
        targetLanguage,
      );
      try {
        await this.redisWordsCache.saveWords(
          sourceLanguage,
          targetLanguage,
          words,
        );
      } catch (error) {
        logger.error("[cache] Failed to save words in Redis", error);
      }
    }

    return words;
  }

  private checkAnswer(
    answer: Record<string, boolean>,
    wordsToReview: WordRanking[],
  ) {
    if (
      !this.arraysEqual(
        Object.keys(answer),
        wordsToReview.map((item) => String(item.id)),
      )
    ) {
      throw new VocabAssessmentError(
        "Answer doesn't contain all required words",
        null,
        {
          answer,
          wordsToReview,
        },
      );
    }

    let identifiedWordsCount = 0;
    for (const [, isKnown] of Object.entries(answer)) {
      if (isKnown) identifiedWordsCount++;
    }
    return identifiedWordsCount / Object.keys(answer).length;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private arraysEqual(arr1: any[], arr2: any[]) {
    if (arr1.length !== arr2.length) return false;

    return (
      arr1.every((item) => arr2.includes(item)) &&
      arr2.every((item) => arr1.includes(item))
    );
  }

  private isValidSessionState(state: unknown): state is SessionState {
    if (!state || typeof state !== "object") return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = state as any;
    return (
      typeof s.min === "number" &&
      typeof s.max === "number" &&
      typeof s.mid === "number" &&
      Array.isArray(s.wordsToReview) &&
      typeof s.range === "number"
    );
  }
}
