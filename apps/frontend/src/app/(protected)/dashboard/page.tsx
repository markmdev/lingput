"use client";

import { Story } from "@/features/story/types";
import { ApiError } from "@/types/ApiError";
import { useCallback } from "react";
import Dashboard from "@/components/Dashboard";
import { useWordStatus } from "@/features/story/hooks/useWordStatus";
import { useStories } from "@/features/story/hooks/useStories";
import useWordsCount from "@/features/vocab/hooks/useWordsCount";
import useViewMode from "@/features/dashboard/hooks/useViewMode";
import OnboardingProvider from "@/features/dashboard/onboarding/OnboardingProvider";
import useCoachmarkSteps from "@/features/dashboard/onboarding/useCoachmarkSteps";
import useAuthRedirect from "@/features/auth/hooks/useAuthRedirect";

export default function DashboardPage() {
  const { viewMode, setViewMode, chosenStoryId } = useViewMode();
  const { stories, error, isLoading, mutateStories } = useStories();
  const { wordsCount } = useWordsCount();
  const chosenStory = stories?.find((s) => String(s.id) === chosenStoryId) ?? null;
  const { setWordStatus } = useWordStatus(chosenStory, mutateStories);

  useAuthRedirect(error);

  const handleClickOnStory = useCallback(
    (story: Story) => {
      setViewMode("chosenStory", String(story.id));
    },
    [setViewMode]
  );

  if (error?.statusCode === 401) {
    return <div>Redirecting...</div>;
  }

  if (error) throw new ApiError("Unexpected server error", 502);

  return (
    <OnboardingProvider wordsCount={wordsCount} useCoachmarkSteps={useCoachmarkSteps}>
      <Dashboard
        wordsCount={wordsCount}
        viewMode={viewMode}
        handleChangeToNewStoryViewMode={() => setViewMode("newStory")}
        handleChangeToAllStoriesViewMode={() => setViewMode("allStories")}
        isLoading={isLoading}
        data={stories}
        handleClickOnStory={handleClickOnStory}
        chosenStory={chosenStory}
        handleWordStatusChange={setWordStatus}
        mutate={mutateStories}
      />
    </OnboardingProvider>
  );
}
