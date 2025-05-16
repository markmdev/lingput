import { ClientApi } from "@/lib/ClientApi";
import { useState } from "react";
import { StoryApi } from "../api";
import { Story } from "../types";

export default function StoryGeneration({
  refetchStories,
  setToNewStory,
}: {
  refetchStories: () => void;
  setToNewStory: (story: Story) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const clientApi = new ClientApi();
  const storyApi = new StoryApi(clientApi);

  const handleGenerateStory = async () => {
    setIsLoading(true);
    const story = await storyApi.generateNewStory();
    console.log(story);
    setIsLoading(false);
    refetchStories();
    setToNewStory(story);
  };
  return (
    <div className="border p-4 flex flex-row gap-6 w-2/3">
      <button className="px-4 py-2 border" onClick={handleGenerateStory}>
        {isLoading ? "Loading..." : "Generate"}
      </button>
    </div>
  );
}
