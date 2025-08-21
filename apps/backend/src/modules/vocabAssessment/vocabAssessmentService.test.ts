import { VocabAssessmentService } from "./vocabAssessmentService";
import { VocabAssessmentRepository } from "./vocabAssessmentRepository";
import { SessionService } from "../session/sessionService";
import { VocabularyService } from "../vocabulary/vocabularyService";
import { RedisWordsCache } from "@/cache/redisWordsCache";
import { VocabAssessmentError } from "@/errors/VocabAssessmentError";
import { Session } from "../session/sessionRepository";

function generateWords(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    word: `w${i + 1}`,
    translation: `t${i + 1}`,
    frequencyRank: i + 1,
    source_language: "en",
    target_language: "de",
  })) as any[];
}

describe("VocabAssessmentService", () => {
  const sourceLanguage = "en";
  const targetLanguage = "de";

  it("startAssessment uses cache hit and returns words chunk", async () => {
    const words = generateWords(300);
    const repository = { getWords: jest.fn() } as unknown as VocabAssessmentRepository;
    const sessionService = {
      createSession: jest.fn().mockResolvedValue({ sessionUUID: "abc", status: "active" }),
    } as unknown as SessionService;
    const vocabularyService = {} as unknown as VocabularyService;
    const cache = {
      getWords: jest.fn().mockResolvedValue(words),
      saveWords: jest.fn(),
    } as unknown as RedisWordsCache;

    const service = new VocabAssessmentService(
      repository,
      sessionService,
      vocabularyService,
      cache
    );
    const res = await service.startAssessment(1, sourceLanguage, targetLanguage);

    expect(cache.getWords).toHaveBeenCalledWith(sourceLanguage, targetLanguage);
    expect(repository.getWords).not.toHaveBeenCalled();
    expect(res.status).toBe("active");
    expect(res.sessionId).toBe("abc");
    expect(Array.isArray(res.wordsToReview)).toBe(true);
    expect(res.wordsToReview.length).toBe(15);
    expect(res.step).toBe(1);
    expect(res.lastStep).toBe(false);
  });

  it("startAssessment loads from repository on cache miss and saves cache", async () => {
    const words = generateWords(300);
    const repository = {
      getWords: jest.fn().mockResolvedValue(words),
    } as unknown as VocabAssessmentRepository;
    const sessionService = {
      createSession: jest.fn().mockResolvedValue({ sessionUUID: "abc", status: "active" }),
    } as unknown as SessionService;
    const vocabularyService = {} as unknown as VocabularyService;
    const cache = {
      getWords: jest.fn().mockResolvedValue(null),
      saveWords: jest.fn().mockResolvedValue(undefined),
    } as unknown as RedisWordsCache;

    const service = new VocabAssessmentService(
      repository,
      sessionService,
      vocabularyService,
      cache
    );
    const res = await service.startAssessment(1, sourceLanguage, targetLanguage);

    expect(repository.getWords).toHaveBeenCalledWith(sourceLanguage, targetLanguage);
    expect(cache.saveWords).toHaveBeenCalled();
    expect(res.wordsToReview.length).toBe(15);
  });

  it("continueAssessment throws on invalid session", async () => {
    const repository = {} as unknown as VocabAssessmentRepository;
    const sessionService = {
      getSession: jest.fn().mockResolvedValue(null),
    } as unknown as SessionService;
    const vocabularyService = {} as unknown as VocabularyService;
    const cache = {} as unknown as RedisWordsCache;

    const service = new VocabAssessmentService(
      repository,
      sessionService,
      vocabularyService,
      cache
    );

    await expect(
      service.continueAssessment(1, "sess", undefined, sourceLanguage, targetLanguage)
    ).rejects.toBeInstanceOf(VocabAssessmentError);
  });

  it("continueAssessment returns current state when no answer provided", async () => {
    const words = generateWords(200);
    const repository = {} as unknown as VocabAssessmentRepository;
    const state = {
      min: 0,
      max: 100,
      mid: 50,
      wordsToReview: words.slice(40, 55),
      range: 15,
      isLastStep: false,
      step: 3,
    };
    const session: Session = { userId: 1, state, sessionUUID: "s", status: "active" };
    const sessionService = {
      getSession: jest.fn().mockResolvedValue(session),
    } as unknown as SessionService;
    const vocabularyService = {} as unknown as VocabularyService;
    const cache = {
      getWords: jest.fn().mockResolvedValue(words),
    } as unknown as RedisWordsCache;
    const service = new VocabAssessmentService({} as any, sessionService, vocabularyService, cache);

    const res = await service.continueAssessment(1, "s", undefined, sourceLanguage, targetLanguage);
    expect(res).toEqual({
      sessionId: "s",
      status: "active",
      wordsToReview: state.wordsToReview,
      lastStep: false,
      step: 3,
      vocabularySize: undefined,
    });
  });

  it("continueAssessment progresses, sets lastStep when range < 100, and updates session", async () => {
    const words = generateWords(200);
    const state = {
      min: 0,
      max: 50,
      mid: 25,
      wordsToReview: words.slice(18, 33),
      range: 15,
      isLastStep: false,
      step: 1,
    };
    const session: Session = { userId: 1, state, sessionUUID: "s1", status: "active" };
    const sessionService = {
      getSession: jest.fn().mockResolvedValue(session),
      updateSessionState: jest.fn().mockResolvedValue({ ...session, state }),
    } as unknown as SessionService;
    const repository = {} as unknown as VocabAssessmentRepository;
    const cache = { getWords: jest.fn().mockResolvedValue(words) } as unknown as RedisWordsCache;
    const vocabularyService = {} as unknown as VocabularyService;

    const service = new VocabAssessmentService(
      repository,
      sessionService,
      vocabularyService,
      cache
    );

    const answer: Record<string, boolean> = Object.fromEntries(
      state.wordsToReview.map((w: any) => [String(w.id), true])
    );

    const res: any = await service.continueAssessment(
      1,
      "s1",
      answer,
      sourceLanguage,
      targetLanguage
    );

    expect(sessionService.updateSessionState).toHaveBeenCalled();
    expect(res.status).toBe("active");
    expect(res.lastStep).toBe(true);
    expect(res.step).toBe(2);
    expect(Array.isArray(res.wordsToReview)).toBe(true);
    expect(res.wordsToReview.length).toBe(15);
  });

  it("continueAssessment finishes when isLastStep was true, completes session and saves vocab", async () => {
    const words = generateWords(200);
    const initialState = {
      min: 0,
      max: 100,
      mid: 40,
      wordsToReview: words.slice(33, 48),
      range: 15,
      isLastStep: true,
      step: 5,
    };
    const session: Session = {
      userId: 2,
      state: initialState,
      sessionUUID: "sx",
      status: "active",
    };
    const sessionService = {
      getSession: jest.fn().mockResolvedValue(session),
      completeSession: jest.fn().mockResolvedValue({ ...session, status: "completed" }),
      updateSessionState: jest.fn().mockResolvedValue({ ...session, status: "completed" }),
    } as unknown as SessionService;
    const repository = {} as unknown as VocabAssessmentRepository;
    const cache = { getWords: jest.fn().mockResolvedValue(words) } as unknown as RedisWordsCache;
    const vocabularyService = {
      saveManyWords: jest.fn().mockResolvedValue([]),
    } as unknown as VocabularyService;

    const service = new VocabAssessmentService(
      repository,
      sessionService,
      vocabularyService,
      cache
    );

    // Provide an answer that results in knowledge ratio below threshold so max = mid
    const answer: Record<string, boolean> = Object.fromEntries(
      initialState.wordsToReview.map((w: any, idx: number) => [String(w.id), idx % 2 === 0])
    );

    const res = await service.continueAssessment(2, "sx", answer, sourceLanguage, targetLanguage);

    expect(sessionService.completeSession).toHaveBeenCalledWith(2, "sx");
    expect(vocabularyService.saveManyWords).toHaveBeenCalled();
    expect(sessionService.updateSessionState).toHaveBeenCalled();
    expect(res.status).toBe("completed");
    expect(typeof res.vocabularySize).toBe("number");
    expect(res.sessionId).toBe("sx");
  });

  it("continueAssessment throws when answer keys don't match", async () => {
    const words = generateWords(200);
    const state = {
      min: 0,
      max: 50,
      mid: 25,
      wordsToReview: words.slice(18, 33),
      range: 15,
      isLastStep: false,
      step: 1,
    };
    const session: Session = { userId: 1, state, sessionUUID: "s2", status: "active" };
    const sessionService = {
      getSession: jest.fn().mockResolvedValue(session),
    } as unknown as SessionService;
    const repository = {} as unknown as VocabAssessmentRepository;
    const cache = { getWords: jest.fn().mockResolvedValue(words) } as unknown as RedisWordsCache;
    const vocabularyService = {} as unknown as VocabularyService;

    const service = new VocabAssessmentService(
      repository,
      sessionService,
      vocabularyService,
      cache
    );

    const badAnswer: Record<string, boolean> = { "999": true };
    await expect(
      service.continueAssessment(1, "s2", badAnswer, sourceLanguage, targetLanguage)
    ).rejects.toBeInstanceOf(VocabAssessmentError);
  });
});
