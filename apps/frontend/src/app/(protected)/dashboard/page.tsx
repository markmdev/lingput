"use client";

import StoryComponent from "@/feautures/story/components/Story";
import StoryList from "@/feautures/story/components/StoryList";
import { Story } from "@/feautures/story/types";
import { StoryApi } from "@/lib/api";
import { ApiError } from "@/types/ApiError";
import { useState } from "react";
import useSWR from "swr";

export default function DashboardPage() {
  const storyApi = new StoryApi();
  const { data, error, isLoading } = useSWR("/api/story", storyApi.getAllStories);
  const [chosenStory, setChosenStory] = useState<null | Story>(null);

  if (isLoading) return "Loading...";
  if (error) return (error as ApiError).message;

  return (
    <div className="flex flex-row gap-4">
      <StoryList storyList={data} setChosenStory={setChosenStory}></StoryList>
      <StoryComponent story={chosenStory} />
    </div>
  );
}
