import { StoryApi } from "@/features/story/api";
import { ClientApi } from "@/lib/ClientApi";
import useSWR from "swr";

export function useStories() {
  const clientApi = new ClientApi();
  const storyApi = new StoryApi(clientApi);
  const { data, error, isLoading, mutate } = useSWR("/api/story", () => storyApi.getAllStories());

  return { stories: data, error, isLoading, mutateStories: mutate };
}
