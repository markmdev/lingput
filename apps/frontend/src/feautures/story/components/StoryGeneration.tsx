import { ClientApi } from "@/lib/ClientApi";
import { useState } from "react";
import { StoryApi } from "../api";
import { Story } from "../types";
import RightPanel from "@/components/RightPanel";
import Button from "@/components/Button";

export default function StoryGeneration({
  refetchStories,
  setToNewStory,
}: {
  refetchStories: () => void;
  setToNewStory: (story: Story) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("");

  const clientApi = new ClientApi();
  const storyApi = new StoryApi(clientApi);

  const handleGenerateStory = async () => {
    setIsLoading(true);
    const story = await storyApi.generateNewStory(topic);
    console.log(story);
    setIsLoading(false);
    refetchStories();
    setToNewStory(story);
  };
  return (
    <RightPanel>
      <form className="flex flex-col gap-4 max-w-1/3">
        <label htmlFor="topic" className="font-bold text-2xl">
          Topic
        </label>
        <input
          type="text"
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="border rounded-lg py-2 px-2 outline-none"
          placeholder="Input your desired topic..."
        />
        <Button type="submit" disabled={isLoading} onClick={handleGenerateStory}>
          Generate
        </Button>
      </form>
    </RightPanel>
  );
}
