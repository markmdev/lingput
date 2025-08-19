"use client";

import LeftPanel from "@/features/dashboard/components/LeftPanel";
import StoryComponent from "@/features/story/components/Story";
import StoryGeneration from "@/features/story/components/StoryGeneration";
import StoryList from "@/features/story/components/StoryList";
import Skeleton from "react-loading-skeleton";
import AssessmentRequiredOverlay from "./AssessmentRequiredOverlay";
import Button from "./Button";
import OnboardingCoachmarks from "./OnboardingCoachmarks";
import OnboardingOverlay from "./OnboardingOverlay";
import RightPanel from "@/features/dashboard/components/RightPanel";
import TopPanelMob from "@/features/dashboard/components/TopPanelMob";
import { Story } from "@/features/story/types";
import { KeyedMutator } from "swr";
import useOnboarding from "@/features/dashboard/onboarding/useOnboarding";
import useOnboardingEvents from "@/features/dashboard/onboarding/useOnboardingEvents";
import { useEffect } from "react";

export default function Dashboard({
  wordsCount,
  viewMode,
  handleChangeToNewStoryViewMode,
  handleChangeToAllStoriesViewMode,
  isLoading,
  data,
  handleClickOnStory,
  chosenStory,
  handleWordStatusChange,
  mutate,
}: {
  wordsCount: number | undefined;
  viewMode: "chosenStory" | "newStory" | "allStories";
  handleChangeToNewStoryViewMode: () => void;
  handleChangeToAllStoriesViewMode: () => void;
  isLoading: boolean;
  data: Story[] | undefined;
  handleClickOnStory: (story: Story) => void;
  chosenStory: Story | null;
  handleWordStatusChange: (wordId: number, newStatus: "learned" | "learning") => void;
  mutate: KeyedMutator<Story[]>;
}) {
  const {
    showOnboarding,
    hasIntroShown,
    coachmarkIndex,
    coachmarkDisableNext,
    coachmarkSteps,
    completeIntro,
    completeOnboarding,
    openCoachmarks,
    goNextCoachmark,
    goBackCoachmark,
  } = useOnboarding();

  useOnboardingEvents();

  useEffect(() => {
    if (showOnboarding && hasIntroShown) {
      const t = setTimeout(() => openCoachmarks(), 200);
      return () => clearTimeout(t);
    }
  }, [showOnboarding, hasIntroShown, openCoachmarks]);

  return (
    <div className="flex flex-col bg-transparent h-screen">
      <AssessmentRequiredOverlay wordsCount={typeof wordsCount === "number" ? wordsCount : -1} />
      {showOnboarding && !hasIntroShown && <OnboardingOverlay onComplete={completeIntro} />}
      {showOnboarding && hasIntroShown && coachmarkIndex !== null && (
        <OnboardingCoachmarks
          step={{ ...coachmarkSteps[coachmarkIndex], disableNext: coachmarkDisableNext }}
          onNext={goNextCoachmark}
          onBack={goBackCoachmark}
          onSkip={completeOnboarding}
        />
      )}
      {/* TOP PANEL (MOB) */}
      <TopPanelMob
        viewMode={viewMode}
        onChangeToNewStoryViewMode={handleChangeToNewStoryViewMode}
        onChangeToAllStoriesViewMode={handleChangeToAllStoriesViewMode}
      />
      <div className="flex flex-row gap-6 flex-1 min-h-0">
        {/* LEFT PANEL */}
        <LeftPanel
          isLoading={isLoading}
          data={data}
          handleClickOnStory={handleClickOnStory}
          chosenStory={chosenStory}
          viewMode={viewMode}
          handleChangeToNewStoryViewMode={handleChangeToNewStoryViewMode}
        />
        {/* RIGHT */}
        {viewMode === "chosenStory" && (
          <RightPanel>
            <StoryComponent story={chosenStory} onWordStatusChange={handleWordStatusChange} />
          </RightPanel>
        )}
        {viewMode === "newStory" && (
          <RightPanel styles="bg-radial from-white to-gray-100 from-30% bg-no-repeat justify-center">
            <StoryGeneration
              mutate={mutate}
              setToNewStory={handleClickOnStory}
              isPageLoading={isLoading}
            />
          </RightPanel>
        )}
        {viewMode === "allStories" && (
          <div className="justify-between w-full py-8 px-6 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col border border-slate-100 shadow-sm">
            {/* TOP */}
            <div>
              <h2 className="font-semibold text-2xl tracking-tight text-slate-900">Stories</h2>
              <hr className="my-4 border-slate-200" />
              {isLoading ? (
                <Skeleton count={6} height={50} baseColor="#eef2ff" highlightColor="#f8fafc" />
              ) : (
                <StoryList
                  storyList={data}
                  setChosenStory={handleClickOnStory}
                  chosenStoryId={chosenStory?.id || null}
                ></StoryList>
              )}
            </div>
            {/* BOTTOM */}
            <Button onClick={handleChangeToNewStoryViewMode}>Generate New Story</Button>
          </div>
        )}
      </div>
    </div>
  );
}
