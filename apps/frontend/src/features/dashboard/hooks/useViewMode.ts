import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type ViewMode = "chosenStory" | "newStory" | "allStories";

export default function useViewMode() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chosenStoryId = searchParams.get("story");

  const viewMode: ViewMode = (searchParams.get("viewMode") as ViewMode) || "newStory";

  const setViewMode = useCallback(
    (mode: ViewMode, storyId?: string | null) => {
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

  return { viewMode, setViewMode, chosenStoryId };
}
