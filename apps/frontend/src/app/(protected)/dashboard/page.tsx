"use client";

import { StoryApi } from "@/features/story/api";
import StoryComponent from "@/features/story/components/Story";
import StoryList from "@/features/story/components/StoryList";
import { Story } from "@/features/story/types";
import { ClientApi } from "@/lib/ClientApi";
import { ApiError } from "@/types/ApiError";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";
import StoryGeneration from "@/features/story/components/StoryGeneration";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import Skeleton from "react-loading-skeleton";
import RightPanel from "@/components/RightPanel";
import TopPanelMob from "@/components/TopPanelMob";
import { UnknownWordApi } from "@/features/unknownWord/api";
import LeftPanel from "@/features/dashboard/LeftPanel";
import { handleJob, JobStarter } from "@/lib/jobHandler";
import { VocabApi } from "@/features/vocab/api";
import AssessmentRequiredOverlay from "@/components/AssessmentRequiredOverlay";
import OnboardingOverlay from "@/components/OnboardingOverlay";
import OnboardingCoachmarks, { CoachmarkStep } from "@/components/OnboardingCoachmarks";

const clientApi = new ClientApi();
const storyApi = new StoryApi(clientApi);
const unknownWordApi = new UnknownWordApi(clientApi);
const vocabApi = new VocabApi(clientApi);

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const chosenStoryId = searchParams.get("story");
  const { data, error, isLoading, mutate } = useSWR("/api/story", () => storyApi.getAllStories());
  const { data: wordsCount } = useSWR("/api/vocab/words-count", () => vocabApi.getWordsCount());
  const chosenStory = data?.find((s) => String(s.id) === chosenStoryId) ?? null;
  const viewMode: "chosenStory" | "newStory" | "allStories" =
    (searchParams.get("viewMode") as "chosenStory" | "newStory" | "allStories") || "newStory";
  const router = useRouter();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasIntroShown, setHasIntroShown] = useState(false);
  const [coachmarkIndex, setCoachmarkIndex] = useState<number | null>(null);
  const [coachmarkDisableNext, setCoachmarkDisableNext] = useState(false);
  const [isWaitingForStory, setIsWaitingForStory] = useState(false);

  const assessmentRequired = useMemo(
    () => (typeof wordsCount === "number" ? wordsCount === 0 : false),
    [wordsCount]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "compinput_onboarding_completed";
    const completed = window.localStorage.getItem(key);
    setShowOnboarding(!assessmentRequired && completed !== "true");
  }, [assessmentRequired]);

  const completeOnboarding = useCallback(() => {
    const key = "compinput_onboarding_completed";
    window.localStorage.setItem(key, "true");
    setShowOnboarding(false);
    setCoachmarkIndex(null);
    setIsWaitingForStory(false);
  }, []);

  const completeIntro = useCallback(() => {
    setHasIntroShown(true);
  }, []);

  useEffect(() => {
    if (error?.statusCode === 401) {
      router.replace("/login");
    }
  }, [error, router]);

  const setViewMode = useCallback(
    (mode: "chosenStory" | "newStory" | "allStories", storyId?: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("viewMode", mode);
      if (storyId) {
        params.set("story", storyId);
      } else {
        params.delete("story");
      }
      router.replace(`${window.location.pathname}?${params.toString()}`);
    },
    [router, searchParams]
  );

  const updateCurrentDataWithNewWordStatus = (
    currentData: Story[] | undefined,
    wordId: number,
    newStatus: "learned" | "learning"
  ) => {
    if (!currentData) return currentData;
    return currentData.map((story) => {
      if (story.id !== chosenStory?.id) {
        return story;
      }
      return {
        ...story,
        unknownWords: story.unknownWords.map((word) =>
          word.id !== wordId ? word : { ...word, status: newStatus }
        ),
      };
    });
  };

  const handleWordStatusChange = async (wordId: number, newStatus: "learned" | "learning") => {
    let jobStarter: JobStarter;
    const optimisticUpdate = (data: Story[] | undefined) =>
      updateCurrentDataWithNewWordStatus(data, wordId, newStatus);
    const onSuccess = () => {
      toast(`Word marked as ${newStatus}`);
    };
    const onError = ({ error }: { error?: Error }) => {
      if (error) {
        toast.error(error.message);
      }
    };

    const jobStatusChecker = (jobId: string) => unknownWordApi.checkJobStatus(jobId);
    if (newStatus === "learned") {
      jobStarter = () => unknownWordApi.markAsLearned(wordId);
    } else {
      jobStarter = () => unknownWordApi.markAsLearning(wordId);
    }
    await handleJob({
      jobStarter,
      jobStatusChecker,
      optimisticUpdate,
      mutate,
      onSuccess,
      onError,
    });
  };

  const handleClickOnStory = useCallback(
    (story: Story) => {
      setViewMode("chosenStory", String(story.id));
    },
    [setViewMode]
  );

  const handleChangeToNewStoryViewMode = useCallback(() => {
    setViewMode("newStory");
  }, [setViewMode]);

  const handleChangeToAllStoriesViewMode = useCallback(() => {
    setViewMode("allStories");
  }, [setViewMode]);

  // Define coachmark steps
  const coachmarkSteps: CoachmarkStep[] = useMemo(
    () => [
      {
        title: "Welcome!",
        description: "Let’s quickly create your first story.",
        showNext: true,
      },
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

  // Advance logic based on events
  useEffect(() => {
    if (!showOnboarding || !hasIntroShown) return;

    const handleTopicSelected = () => {
      setCoachmarkDisableNext(false);
    };
    const handleTopicTyping = (e: Event) => {
      try {
        // @ts-expect-error custom event detail
        const topic = e?.detail?.topic as string | undefined;
        setCoachmarkDisableNext(!(topic && topic.trim().length > 0));
      } catch {
        setCoachmarkDisableNext(true);
      }
    };
    const handleGenerateClicked = () => {
      setCoachmarkDisableNext(true);
      setIsWaitingForStory(true);
    };
    const handleStoryCreated = () => {
      setCoachmarkDisableNext(false);
      setIsWaitingForStory(false);
      setCoachmarkIndex((i) => (i !== null ? Math.max(i, 4) : 4));
    };
    const handleWordMarked = (e: Event) => {
      // @ts-expect-error custom event detail
      const status = e?.detail?.status as "learned" | "learning" | undefined;
      if (status === "learned") {
        setCoachmarkDisableNext(false);
      }
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
  }, [showOnboarding, hasIntroShown]);

  // Start coachmarks after intro overlay dismissed
  useEffect(() => {
    if (!showOnboarding || !hasIntroShown) return;
    const t = setTimeout(() => setCoachmarkIndex(0), 200);
    return () => clearTimeout(t);
  }, [showOnboarding, hasIntroShown]);

  // Initialize disableNext when entering specific steps
  useEffect(() => {
    if (coachmarkIndex === null) return;
    // Step indexes: 0 welcome, 1 topic-input, 2 suggested, 3 generate, 4 open, 5 learned
    if (coachmarkIndex === 1) {
      // Require non-empty topic before proceeding
      setCoachmarkDisableNext(true);
    } else if (coachmarkIndex === 3) {
      // Require generation and completion before proceeding
      setCoachmarkDisableNext(true);
    } else if (coachmarkIndex === 5) {
      // Require marking a word as Learned before finishing
      setCoachmarkDisableNext(true);
    } else {
      setCoachmarkDisableNext(false);
    }
  }, [coachmarkIndex]);

  const goNextCoachmark = useCallback(() => {
    setCoachmarkIndex((i) => {
      if (i === null) return 0;
      const next = i + 1;
      if (next >= coachmarkSteps.length) {
        completeOnboarding();
        return null;
      }
      return next;
    });
  }, [coachmarkSteps.length, completeOnboarding]);

  const goBackCoachmark = useCallback(() => {
    setCoachmarkIndex((i) => (i && i > 0 ? i - 1 : 0));
  }, []);

  if (error?.statusCode === 401) {
    return <div>Redirecting...</div>;
  }

  if (error) throw new ApiError("Unexpected server error", 502);

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
