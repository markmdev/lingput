"use client";

import { useEffect } from "react";
import { useOnboardingContext } from "./OnboardingProvider";

export default function useOnboarding() {
  const ctx = useOnboardingContext();
  const { coachmarkIndex, setDisableNext } = ctx;

  useEffect(() => {
    if (coachmarkIndex === null) return;
    // 0 welcome, 1 topic-input, 2 suggested, 3 generate, 4 open, 5 learned
    if (coachmarkIndex === 1) setDisableNext(true);
    else if (coachmarkIndex === 3) setDisableNext(true);
    else if (coachmarkIndex === 5) setDisableNext(true);
    else setDisableNext(false);
  }, [coachmarkIndex, setDisableNext]);

  return ctx;
}
