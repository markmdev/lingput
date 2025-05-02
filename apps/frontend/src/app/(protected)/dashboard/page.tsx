"use client";

import StoryComponent from "@/app/components/Story";
import StoryList from "@/app/components/StoryList";
import { StoryApi } from "@/app/lib/api";
import { ApiError } from "@/app/types/ApiError";
import { Story } from "@/app/types/ApiObjects";
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
