"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { CoachmarkStep } from "@/components/OnboardingCoachmarks";

type State = {
  showOnboarding: boolean;
  hasIntroShown: boolean;
  coachmarkIndex: number | null;
  coachmarkDisableNext: boolean;
  isWaitingForStory: boolean;
};

type Action =
  | { type: "INIT"; assessmentRequired: boolean }
  | { type: "COMPLETE_INTRO" }
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "SET_DISABLE_NEXT"; value: boolean }
  | { type: "SET_WAITING"; value: boolean }
  | { type: "NEXT"; stepsLen: number; onFinish: () => void }
  | { type: "BACK" }
  | { type: "JUMP_TO"; index: number }
  | { type: "OPEN" }; // start coachmarks after intro

const LS_KEY = "compinput_onboarding_completed";

const initial: State = {
  showOnboarding: false,
  hasIntroShown: false,
  coachmarkIndex: null,
  coachmarkDisableNext: false,
  isWaitingForStory: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT": {
      const completed =
        typeof window !== "undefined" ? window.localStorage.getItem(LS_KEY) : "true";
      const show = !action.assessmentRequired && completed !== "true";
      return { ...state, showOnboarding: show };
    }
    case "COMPLETE_INTRO":
      return { ...state, hasIntroShown: true };
    case "OPEN":
      return { ...state, coachmarkIndex: 0 };
    case "COMPLETE_ONBOARDING":
      if (typeof window !== "undefined") window.localStorage.setItem(LS_KEY, "true");
      return { ...state, showOnboarding: false, coachmarkIndex: null, isWaitingForStory: false };
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
    dispatch({ type: "INIT", assessmentRequired });
  }, [assessmentRequired]);

  const coachmarkSteps = useCoachmarkSteps(state.isWaitingForStory);

  const completeIntro = useCallback(() => dispatch({ type: "COMPLETE_INTRO" }), []);
  const completeOnboarding = useCallback(() => dispatch({ type: "COMPLETE_ONBOARDING" }), []);
  const setDisableNext = useCallback(
    (v: boolean) => dispatch({ type: "SET_DISABLE_NEXT", value: v }),
    []
  );
  const setWaiting = useCallback((v: boolean) => dispatch({ type: "SET_WAITING", value: v }), []);
  const next = useCallback(
    (len: number) => dispatch({ type: "NEXT", stepsLen: len, onFinish: completeOnboarding }),
    [completeOnboarding]
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
