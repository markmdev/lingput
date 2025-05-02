import { Story } from "../types/ApiObjects";
import StoryPreview from "./StoryPreview";

export default function StoryList({
  setChosenStory,
  storyList = [],
}: {
  setChosenStory: (story: Story) => void;
  storyList?: Story[];
}) {
  console.log(storyList);
  return (
    <div className="w-1/3 cursor-pointer">
      {storyList.map((story) => (
        <div key={story.id} className="border-1 p-4" onClick={() => setChosenStory(story)}>
          <StoryPreview story={story} />
        </div>
      ))}
    </div>
  );
}
