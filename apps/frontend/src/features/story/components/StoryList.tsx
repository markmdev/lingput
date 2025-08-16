import { Story } from "@/features/story/types";
import StoryPreview from "./StoryPreview";

export default function StoryList({
  setChosenStory,
  chosenStoryId,
  storyList = [],
}: {
  setChosenStory: (story: Story) => void;
  chosenStoryId: number | null;
  storyList?: Story[];
}) {
  return (
    <div className="p-2 space-y-1">
      {storyList.map((story) => (
        <div key={story.id} className="cursor-pointer" onClick={() => setChosenStory(story)}>
          <StoryPreview story={story} isSelected={story.id === chosenStoryId} />
        </div>
      ))}
    </div>
  );
}
