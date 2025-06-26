import Button from "@/components/Button";
import Skeleton from "react-loading-skeleton";
import StoryList from "../story/components/StoryList";
import { Story } from "../story/types";

export default function LeftPanel({
  isLoading,
  data,
  handleClickOnStory,
  chosenStory,
  viewMode,
  handleChangeToNewStoryViewMode,
}: {
  isLoading: boolean;
  data: Story[] | undefined;
  handleClickOnStory: (story: Story) => void;
  chosenStory: Story | null;
  viewMode: "chosenStory" | "newStory" | "allStories";
  handleChangeToNewStoryViewMode: () => void;
}) {
  return (
    <div className="justify-between w-1/4 py-8 px-6 bg-white rounded-lg hidden lg:flex lg:flex-col">
      {/* TOP */}
      <div>
        <h2 className="font-semibold text-2xl">Stories</h2>
        <hr className="my-4" />
        {isLoading ? (
          <Skeleton count={6} height={50} />
        ) : (
          <StoryList
            storyList={data}
            setChosenStory={handleClickOnStory}
            chosenStoryId={chosenStory?.id || null}
          ></StoryList>
        )}
      </div>
      {/* BOTTOM */}
      <Button
        styles={viewMode === "newStory" ? "bg-gray-500 cursor-not-allowed" : ""}
        disabled={viewMode === "newStory"}
        onClick={handleChangeToNewStoryViewMode}
      >
        Generate New Story
      </Button>
    </div>
  );
}
