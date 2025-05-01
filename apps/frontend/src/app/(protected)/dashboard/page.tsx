"use client";

import StoryList from "@/app/components/StoryList";
import { StoryApi } from "@/app/lib/api";
import { ApiError } from "@/app/types/ApiError";
import useSWR from "swr";

export default function DashboardPage() {
  const storyApi = new StoryApi();
  const { data, error, isLoading } = useSWR("/api/story", storyApi.getAllStories);

  if (isLoading) return "Loading...";
  if (error) return (error as ApiError).message;

  return <StoryList storyList={data}></StoryList>;
}
