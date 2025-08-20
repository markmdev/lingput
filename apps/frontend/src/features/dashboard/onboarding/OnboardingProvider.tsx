"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { CoachmarkStep } from "@/components/OnboardingCoachmarks";
import { ClientApi } from "@/lib/ClientApi";
import { OnboardingApi } from "./api";

type State = {
  showOnboarding: boolean;
  hasIntroShown: boolean;
  coachmarkIndex: number | null;
  coachmarkDisableNext: boolean;
  isWaitingForStory: boolean;
  error: string | null;
};

type Action =
  | { type: "INIT"; assessmentRequired: boolean }
  | { type: "CHECK_SUCCESS"; completed: boolean; assessmentRequired: boolean }
  | { type: "CHECK_FAILURE"; error: string }
  | { type: "COMPLETE_INTRO" }
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "COMPLETE_ONBOARDING_SUCCESS" }
  | { type: "COMPLETE_ONBOARDING_FAILURE"; error: string }
  | { type: "SET_DISABLE_NEXT"; value: boolean }
  | { type: "SET_WAITING"; value: boolean }
  | { type: "NEXT"; stepsLen: number }
  | { type: "BACK" }
  | { type: "JUMP_TO"; index: number }
  | { type: "OPEN" }; // start coachmarks after intro

const initial: State = {
  showOnboarding: false,
  hasIntroShown: false,
  coachmarkIndex: null,
  coachmarkDisableNext: false,
  isWaitingForStory: false,
  error: null,
};

const clientApi = new ClientApi();
const onboardingApi = new OnboardingApi(clientApi);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "CHECK_SUCCESS":
      return {
        ...state,
        showOnboarding: !action.completed && !action.assessmentRequired,
        error: null,
      };
    case "CHECK_FAILURE":
      return { ...state, error: action.error };
    case "COMPLETE_INTRO":
      return { ...state, hasIntroShown: true };
    case "OPEN":
      return { ...state, coachmarkIndex: 0 };
    case "COMPLETE_ONBOARDING_SUCCESS":
      return {
        ...state,
        showOnboarding: false,
        coachmarkIndex: null,
        isWaitingForStory: false,
        error: null,
      };
    case "COMPLETE_ONBOARDING_FAILURE":
      return { ...state, error: action.error };
    case "SET_DISABLE_NEXT":
      return { ...state, coachmarkDisableNext: action.value };
    case "SET_WAITING":
      return { ...state, isWaitingForStory: action.value };
    case "NEXT": {
      const i = state.coachmarkIndex ?? 0;
      const next = i + 1;
      if (next >= action.stepsLen) return reducer(state, { type: "COMPLETE_ONBOARDING" });
      return { ...state, coachmarkIndex: next };
    }
    case "BACK": {
      const i = state.coachmarkIndex ?? 0;
      return { ...state, coachmarkIndex: i > 0 ? i - 1 : 0 };
    }
    case "JUMP_TO":
      return { ...state, coachmarkIndex: action.index };
    default:
      return state;
  }
}

type Ctx = State & {
  completeIntro: () => void;
  completeOnboarding: () => void;
  setDisableNext: (v: boolean) => void;
  setWaiting: (v: boolean) => void;
  openCoachmarks: () => void;
  setOpenStep: (i: number) => void;
  coachmarkSteps: CoachmarkStep[];
  goNextCoachmark: () => void;
  goBackCoachmark: () => void;
};

const OnboardingCtx = createContext<Ctx | null>(null);

export default function OnboardingProvider({
  children,
  wordsCount,
  useCoachmarkSteps,
}: {
  children: React.ReactNode;
  wordsCount: number | undefined;
  useCoachmarkSteps: (isWaiting: boolean) => CoachmarkStep[];
}) {
  const [state, dispatch] = useReducer(reducer, initial);

  const assessmentRequired = useMemo(
    () => (typeof wordsCount === "number" ? wordsCount === 0 : false),
    [wordsCount]
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await onboardingApi.check(); // { status: "completed" | "not_started" }
        if (cancelled) return;
        dispatch({
          type: "CHECK_SUCCESS",
          completed: res.status === "completed",
          assessmentRequired,
        });
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to check onboarding";
        dispatch({ type: "CHECK_FAILURE", error: message });
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [assessmentRequired]);

  const coachmarkSteps = useCoachmarkSteps(state.isWaitingForStory);

  const completeIntro = useCallback(() => dispatch({ type: "COMPLETE_INTRO" }), []);
  const setDisableNext = useCallback(
    (v: boolean) => dispatch({ type: "SET_DISABLE_NEXT", value: v }),
    []
  );
  const setWaiting = useCallback((v: boolean) => dispatch({ type: "SET_WAITING", value: v }), []);

  const completeOnboarding = useCallback(async () => {
    try {
      await onboardingApi.complete();
      dispatch({ type: "COMPLETE_ONBOARDING_SUCCESS" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to complete onboarding";
      dispatch({ type: "COMPLETE_ONBOARDING_FAILURE", error: message });
    }
  }, []);

  const next = useCallback(
    (len: number) => {
      if ((state.coachmarkIndex ?? 0) + 1 >= len) {
        void completeOnboarding();
      } else {
        dispatch({ type: "NEXT", stepsLen: len });
      }
    },
    [state.coachmarkIndex, completeOnboarding]
  );

  const back = useCallback(() => dispatch({ type: "BACK" }), []);
  const openCoachmarks = useCallback(() => dispatch({ type: "OPEN" }), []);
  const setOpenStep = useCallback((i: number) => dispatch({ type: "JUMP_TO", index: i }), []);
  const goNextCoachmark = () => next(coachmarkSteps.length);
  const goBackCoachmark = () => back();

  const value: Ctx = {
    ...state,
    completeIntro,
    completeOnboarding,
    setDisableNext,
    setWaiting,
    openCoachmarks,
    setOpenStep,
    coachmarkSteps,
    goNextCoachmark,
    goBackCoachmark,
  };

  return <OnboardingCtx.Provider value={value}>{children}</OnboardingCtx.Provider>;
}

export function useOnboardingContext() {
  const ctx = useContext(OnboardingCtx);
  if (!ctx) throw new Error("useOnboardingContext must be used inside OnboardingProvider");
  return ctx;
}
