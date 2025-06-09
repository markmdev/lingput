"use client";

import { StoryApi } from "@/feautures/story/api";
import StoryComponent from "@/feautures/story/components/Story";
import StoryList from "@/feautures/story/components/StoryList";
import { Story } from "@/feautures/story/types";
import { ClientApi } from "@/lib/ClientApi";
import { ApiError } from "@/types/ApiError";
import { useState } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";
import NewStoryButton from "@/components/NewStoryButton";
import StoryGeneration from "@/feautures/story/components/StoryGeneration";
export default function DashboardPage() {
  const clientApi = new ClientApi();
  const storyApi = new StoryApi(clientApi);
  const { data, error, isLoading, mutate } = useSWR("/api/story", () => storyApi.getAllStories());
  const [chosenStory, setChosenStory] = useState<null | Story>(null);
  const [viewMode, setViewMode] = useState<"chosenStory" | "newStory">("chosenStory");

  const refetchStories = () => {
    mutate();
  };

  const handleWordStatusChange = (wordId: number, newStatus: "learned" | "learning") => {
    if (!chosenStory) return;
    const updatedStory: Story = {
      ...chosenStory,
      unknownWords: chosenStory.unknownWords.map((w) => (w.id === wordId ? { ...w, status: newStatus } : w)),
    };

    setChosenStory(updatedStory);
    toast(`Word marked as ${newStatus}`);
  };

  const handleClickOnGenerateNewStory = () => {
    setViewMode("newStory");
  };

  const handleClickOnStory = (story: Story) => {
    setChosenStory(story);
    setViewMode("chosenStory");
  };

  if (isLoading) return "Loading...";
  if (error) return (error as ApiError).message;

  return (
    <div className="flex flex-row gap-8 bg-gray-100 h-screen py-1">
      {/* LEFT */}
      <div className="flex flex-col justify-between w-1/4 py-8 px-6 bg-white rounded-lg">
        {/* TOP */}
        <div>
          <h2 className="font-semibold text-2xl">Stories</h2>
          <hr className="my-4" />
          <StoryList
            storyList={data}
            setChosenStory={handleClickOnStory}
            chosenStoryId={chosenStory?.id || null}
          ></StoryList>
        </div>
        {/* BOTTOM */}
        <NewStoryButton onClick={handleClickOnGenerateNewStory} />
      </div>
      {/* RIGHT */}
      <div className="w-3/4 bg-white rounded-lg">
        {viewMode === "chosenStory" && (
          <StoryComponent story={chosenStory} onWordStatusChange={handleWordStatusChange} />
        )}
        {viewMode === "newStory" && (
          <StoryGeneration refetchStories={refetchStories} setToNewStory={handleClickOnStory} />
        )}
      </div>
    </div>
  );
}
