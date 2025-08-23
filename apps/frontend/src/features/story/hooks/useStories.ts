import { StoryApi } from "@/features/story/api";
import { ClientApi } from "@/lib/ClientApi";
import { ApiError } from "@/types/ApiError";
import useSWR, { KeyedMutator } from "swr";
import { Story } from "../types";

export function useStories(): {
  stories: Story[] | undefined;
  error: ApiError;
  isLoading: boolean;
  mutateStories: KeyedMutator<Story[]>;
} {
  const clientApi = new ClientApi();
  const storyApi = new StoryApi(clientApi);
  const { data, error, isLoading, mutate } = useSWR("/api/story", () => storyApi.getAllStories());

  return { stories: data, error, isLoading, mutateStories: mutate };
}
