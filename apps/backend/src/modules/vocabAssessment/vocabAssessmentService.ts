import { VocabAssessmentError } from "@/errors/VocabAssessmentError";
import { SessionService } from "../session/sessionService";
import { VocabAssessmentRepository } from "./vocabAssessmentRepository";
import { WordRanking, Session } from "@prisma/client";
import { VocabularyService } from "../vocabulary/vocabularyService";
import { UserVocabularyDTO } from "../vocabulary/vocabulary.types";
import { RedisWordsCache } from "@/cache/redisWordsCache";

const WORDS_PER_BATCH = 15;
const KNOWLEDGE_THRESHOLD = 0.8;
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
    private redisWordsCache: RedisWordsCache
  ) {}

  async startAssessment(userId: number, sourceLanguage: string, targetLanguage: string) {
    let words: WordRanking[] | undefined;
    words = await this.redisWordsCache.getWordsFromCache(sourceLanguage, targetLanguage);
    if (!words) {
      words = await this.vocabAssessmentRepository.getWords(sourceLanguage, targetLanguage);
      await this.redisWordsCache.saveWordsToCache(sourceLanguage, targetLanguage, words);
    }

    const max = words.length - 1;
    const min = 0;
    const mid = (max + min) / 2;
    const wordsToReview = words.slice(mid - WORDS_PER_BATCH / 2, mid + WORDS_PER_BATCH / 2);
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
    sessionUUID: string,
    answer: Record<string, boolean> | undefined,
    sourceLanguage = "en",
    targetLanguage = "de"
  ) {
    const session = await this.sessionService.getSession(sessionUUID);
    if (!session?.state)
      throw new VocabAssessmentError("Session not found or invalid state", null, { session });

    const state = session.state as unknown as SessionState;
    if (!this.isValidSessionState(state)) {
      throw new VocabAssessmentError("Invalid session state format", null, { state });
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

    let words: WordRanking[] | undefined;
    words = await this.redisWordsCache.getWordsFromCache(sourceLanguage, targetLanguage);
    if (!words) {
      words = await this.vocabAssessmentRepository.getWords(sourceLanguage, targetLanguage);
      await this.redisWordsCache.saveWordsToCache(sourceLanguage, targetLanguage, words);
    }

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
      return this.finishAssessment(state, words, sessionUUID, session);
    } else {
      if (state.max - state.min < MIN_RANGE_FOR_ESTIMATION) {
        state.isLastStep = true;
      }

      state.wordsToReview = words.slice(
        state.mid - WORDS_PER_BATCH / 2,
        state.mid + WORDS_PER_BATCH / 2
      );
      const updatedSession = await this.sessionService.updateSessionState(sessionUUID, state);
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
    state: SessionState,
    words: WordRanking[],
    sessionUUID: string,
    session: Session
  ) {
    const knownVocabularyCount = state.mid;
    const knownVocabulary = words.slice(0, knownVocabularyCount);
    await this.sessionService.completeSession(sessionUUID);
    const vocabularyDTO: UserVocabularyDTO[] = knownVocabulary.map((word) => ({
      word: word.word,
      translation: word.translation,
      article: null,
    }));
    await this.vocabularyService.saveManyWords(vocabularyDTO, session.userId);
    state.wordsToReview = [];
    state.range = 0;
    state.vocabularySize = vocabularyDTO.length;
    await this.sessionService.updateSessionState(sessionUUID, state);
    return { sessionId: sessionUUID, status: "completed", vocabularySize: vocabularyDTO.length };
  }

  private checkAnswer(answer: Record<string, boolean>, wordsToReview: WordRanking[]) {
    if (
      !this.arraysEqual(
        Object.keys(answer),
        wordsToReview.map((item) => String(item.id))
      )
    ) {
      throw new VocabAssessmentError("Answer doesn't contain all required words", null, {
        answer,
        wordsToReview,
      });
    }

    let identifiedWordsCount = 0;
    for (const [word, isKnown] of Object.entries(answer)) {
      if (isKnown) identifiedWordsCount++;
    }
    return identifiedWordsCount / Object.keys(answer).length;
  }

  private arraysEqual(arr1: any[], arr2: any[]) {
    if (arr1.length !== arr2.length) return false;

    return arr1.every((item) => arr2.includes(item)) && arr2.every((item) => arr1.includes(item));
  }

  private isValidSessionState(state: unknown): state is SessionState {
    if (!state || typeof state !== "object") return false;
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
