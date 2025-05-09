import { Story } from "@/feautures/story/types";
import StoryPreview from "./StoryPreview";

export default function StoryList({
  setChosenStory,
  storyList = [],
}: {
  setChosenStory: (story: Story) => void;
  storyList?: Story[];
}) {
  return (
    <div className="w-1/3">
      {storyList.map((story) => (
        <div key={story.id} className="border p-4 cursor-pointer" onClick={() => setChosenStory(story)}>
          <StoryPreview story={story} />
        </div>
      ))}
    </div>
  );
}
