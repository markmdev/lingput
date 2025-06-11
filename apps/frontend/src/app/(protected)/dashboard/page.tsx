"use client";

import { StoryApi } from "@/feautures/story/api";
import StoryComponent from "@/feautures/story/components/Story";
import StoryList from "@/feautures/story/components/StoryList";
import { Story } from "@/feautures/story/types";
import { ClientApi } from "@/lib/ClientApi";
import { ApiError } from "@/types/ApiError";
import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";
import StoryGeneration from "@/feautures/story/components/StoryGeneration";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import Skeleton from "react-loading-skeleton";
import RightPanel from "@/components/RightPanel";

export default function DashboardPage() {
  const clientApi = new ClientApi();
  const storyApi = new StoryApi(clientApi);
  const searchParams = useSearchParams();
  const storyParam = searchParams.get("story");
  const viewModeParam = searchParams.get("viewMode");
  const { data, error, isLoading, mutate } = useSWR("/api/story", () => storyApi.getAllStories());
  const [chosenStory, setChosenStory] = useState<null | Story>(null);
  const [viewMode, setViewMode] = useState<"chosenStory" | "newStory">("chosenStory");
  const router = useRouter();

  if (viewModeParam === "newStory" && viewMode !== "newStory") {
    setViewMode("newStory");
  }

  const refetchStories = () => {
    mutate();
  };

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(window.location.search);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
        router.push(`${window.location.pathname}?${params.toString()}`);
      });
    },
    [router]
  );

  const handleWordStatusChange = (wordId: number, newStatus: "learned" | "learning") => {
    if (!chosenStory) return;
    const updatedStory: Story = {
      ...chosenStory,
      unknownWords: chosenStory.unknownWords.map((w) => (w.id === wordId ? { ...w, status: newStatus } : w)),
    };

    setChosenStory(updatedStory);
    toast(`Word marked as ${newStatus}`);
  };

  const handleClickOnStory = useCallback(
    (story: Story) => {
      setChosenStory(story);
      setViewMode("chosenStory");
      setParams({ story: String(story.id), viewMode: null });
    },
    [setParams]
  );

  const handleChangeToNewStoryViewMode = useCallback(() => {
    setChosenStory(null);
    setViewMode("newStory");
    setParams({ viewMode: "newStory", story: null });
  }, [setParams]);

  useEffect(() => {
    if (!data) return;
    if (storyParam) {
      const foundStory = data?.find((story) => String(story.id) === storyParam);
      if (foundStory) {
        handleClickOnStory(foundStory);
      } else {
        handleChangeToNewStoryViewMode();
      }
    } else {
      handleChangeToNewStoryViewMode();
    }
  }, [data, storyParam, handleChangeToNewStoryViewMode, handleClickOnStory]);

  if (error) throw new ApiError("Unexpected server error", 401);

  return (
    <div className="flex flex-row gap-8 bg-gray-100 h-screen">
      {/* LEFT */}
      <div className="flex flex-col justify-between w-1/4 py-8 px-6 bg-white rounded-lg">
        {/* TOP */}
        <div>
          <h2 className="font-semibold text-2xl">Stories</h2>
          <hr className="my-4" />
          {isLoading ? (
            <Skeleton count={6} height={50} />
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
      {/* RIGHT */}
      {viewMode === "chosenStory" && (
        <RightPanel>
          <StoryComponent story={chosenStory} onWordStatusChange={handleWordStatusChange} />
        </RightPanel>
      )}
      {viewMode === "newStory" && (
        // <RightPanel styles="bg-linear-to-r from-gray-100 to-white justify-center">
        <RightPanel styles="bg-radial from-white to-gray-100 from-30% justify-center">
          <StoryGeneration refetchStories={refetchStories} setToNewStory={handleClickOnStory} />
        </RightPanel>
      )}
    </div>
  );
}
