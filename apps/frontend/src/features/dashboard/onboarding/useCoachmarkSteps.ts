"use client";

import { useMemo } from "react";
import type { CoachmarkStep } from "@/components/OnboardingCoachmarks";

export default function useCoachmarkSteps(isWaitingForStory: boolean): CoachmarkStep[] {
  return useMemo(
    () => [
      { title: "Welcome!", description: "Let’s quickly create your first story.", showNext: true },
      {
        selector: '[data-onboarding="topic-input"]',
        title: "Pick a topic",
        description: "Type a topic or choose one of the suggested topics below.",
        showBack: true,
        showNext: true,
      },
      {
        selector: '[data-onboarding^="suggested-topic-"]',
        title: "Suggested topics",
        description: "Click any suggested topic to fill the topic field instantly.",
        showBack: true,
        showNext: true,
      },
      {
        selector: '[data-onboarding="generate-button"]',
        title: "Generate your story",
        description: isWaitingForStory
          ? "Generating... This usually takes ~30–40 seconds. We’ll continue once it’s ready."
          : "Click Generate to start creating your story.",
        showBack: true,
        showNext: true,
      },
      {
        title: "Open your new story",
        description: "Your story is ready! We’ll open it automatically.",
        showBack: true,
        showNext: true,
      },
      {
        selector: '[data-onboarding="word-learned-button"]',
        title: "Mark as Learned",
        description: "Mark a known word as Learned.",
        showBack: true,
        showNext: true,
        nextLabel: "Finish",
      },
    ],
    [isWaitingForStory]
  );
}
