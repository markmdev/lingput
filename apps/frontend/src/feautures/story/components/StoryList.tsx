import { Story } from "@/feautures/story/types";
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
    <div className="">
      {storyList.map((story) => (
        <div key={story.id} className="p-4 cursor-pointer" onClick={() => setChosenStory(story)}>
          <StoryPreview story={story} isSelected={story.id === chosenStoryId} />
        </div>
      ))}
    </div>
  );
}
