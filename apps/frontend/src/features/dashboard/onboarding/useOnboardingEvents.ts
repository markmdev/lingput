"use client";

import { useEffect } from "react";
import { useOnboardingContext } from "./OnboardingProvider";

export default function useOnboardingEvents() {
  const { showOnboarding, hasIntroShown, setDisableNext, setWaiting, setOpenStep } =
    useOnboardingContext();

  useEffect(() => {
    if (!showOnboarding || !hasIntroShown) return;

    const handleTopicSelected = () => setDisableNext(false);

    const handleTopicTyping = (e: Event) => {
      try {
        // @ts-expect-error custom event detail
        const topic = e?.detail?.topic as string | undefined;
        setDisableNext(!(topic && topic.trim().length > 0));
      } catch {
        setDisableNext(true);
      }
    };

    const handleGenerateClicked = () => {
      setDisableNext(true);
      setWaiting(true);
    };

    const handleStoryCreated = () => {
      setDisableNext(false);
      setWaiting(false);
      setOpenStep(4); // «Open your new story»
    };

    const handleWordMarked = (e: Event) => {
      // @ts-expect-error custom event detail
      const status = e?.detail?.status as "learned" | "learning" | undefined;
      if (status === "learned") setDisableNext(false);
    };

    window.addEventListener("onboarding:topicSelected", handleTopicSelected as EventListener);
    window.addEventListener("onboarding:topicTyping", handleTopicTyping as EventListener);
    window.addEventListener("onboarding:generateClicked", handleGenerateClicked as EventListener);
    window.addEventListener("onboarding:storyCreated", handleStoryCreated as EventListener);
    window.addEventListener("onboarding:wordMarked", handleWordMarked as EventListener);

    return () => {
      window.removeEventListener("onboarding:topicSelected", handleTopicSelected as EventListener);
      window.removeEventListener("onboarding:topicTyping", handleTopicTyping as EventListener);
      window.removeEventListener(
        "onboarding:generateClicked",
        handleGenerateClicked as EventListener
      );
      window.removeEventListener("onboarding:storyCreated", handleStoryCreated as EventListener);
      window.removeEventListener("onboarding:wordMarked", handleWordMarked as EventListener);
    };
  }, [showOnboarding, hasIntroShown, setDisableNext, setWaiting, setOpenStep]);
}
