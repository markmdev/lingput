import { ClientApi } from "@/lib/ClientApi";
import { useState } from "react";
import { StoryApi } from "../api";
import { Story } from "../types";
import Button from "@/components/Button";
import SuggestedTopic from "./SuggestedTopic";

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

  const handleSelectTopic = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setTopic(e.currentTarget.textContent || "");
  };
  return (
    <div>
      <div className="w-full h-full flex flex-col items-center">
        <form className="flex flex-col gap-4 w-1/2 text-center">
          <label htmlFor="topic" className="font-bold text-2xl">
            Topic
          </label>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="border rounded-lg py-2 px-2 outline-none"
              placeholder="Input your desired topic..."
            />
            <div className="flex flex-row gap-2">
              <SuggestedTopic topic="Traveling" onSelectTopic={handleSelectTopic} />
              <SuggestedTopic topic="Food" onSelectTopic={handleSelectTopic} />
              <SuggestedTopic topic="Sports" onSelectTopic={handleSelectTopic} />
              <SuggestedTopic topic="Technology" onSelectTopic={handleSelectTopic} />
              <SuggestedTopic topic="Sci-Fi" onSelectTopic={handleSelectTopic} />
              <SuggestedTopic topic="Fantasy" onSelectTopic={handleSelectTopic} />
              <SuggestedTopic topic="Mystery" onSelectTopic={handleSelectTopic} />
            </div>
          </div>
          <Button type="submit" disabled={isLoading} onClick={handleGenerateStory}>
            Generate
          </Button>
        </form>
      </div>
    </div>
  );
}
