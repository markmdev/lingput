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
    <div className="flex flex-row gap-4">
      <div className="flex flex-col gap-4 w-1/3 p-4">
        <StoryList storyList={data} setChosenStory={handleClickOnStory}></StoryList>
        <NewStoryButton onClick={handleClickOnGenerateNewStory} />
      </div>
      {viewMode === "chosenStory" && <StoryComponent story={chosenStory} onWordStatusChange={handleWordStatusChange} />}
      {viewMode === "newStory" && (
        <StoryGeneration refetchStories={refetchStories} setToNewStory={handleClickOnStory} />
      )}
    </div>
  );
}
