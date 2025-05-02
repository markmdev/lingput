"use client";

import { StoryApi } from "@/feautures/story/api";
import StoryComponent from "@/feautures/story/components/Story";
import StoryList from "@/feautures/story/components/StoryList";
import { Story } from "@/feautures/story/types";
import { ClientApi } from "@/lib/api.client";
import { ApiError } from "@/types/ApiError";
import { useState } from "react";
import useSWR from "swr";

export default function DashboardPage() {
  const clientApi = new ClientApi();
  const storyApi = new StoryApi(clientApi);
  const { data, error, isLoading } = useSWR("/api/story", () => storyApi.getAllStories());
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
