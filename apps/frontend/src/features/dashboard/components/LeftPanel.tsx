import Button from "@/components/Button";
import Skeleton from "react-loading-skeleton";
import StoryList from "@/features/story/components/StoryList";
import { Story } from "@/features/story/types";

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
    <div className="justify-between w-1/4 py-6 px-5 bg-white/80 backdrop-blur-sm rounded-2xl hidden lg:flex lg:flex-col h-full border border-slate-100 shadow-sm">
      {/* TOP */}
      <div className="h-full overflow-auto">
        <div className="flex flex-row justify-between items-center">
          <h2 className="font-semibold text-xl tracking-tight text-slate-900">Stories</h2>
          <p className="text-2xl font-bold text-slate-900">
            <img
              src="/logo_min.png"
              alt="Lingput Logo"
              className="h-12 w-auto inline-block align-middle"
            />
          </p>
        </div>
        <hr className="my-4 border-slate-200" />
        {isLoading ? (
          <Skeleton count={6} height={50} baseColor="#eef2ff" highlightColor="#f8fafc" />
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
        variant={viewMode === "newStory" ? "secondary" : "primary"}
        styles={viewMode === "newStory" ? "cursor-not-allowed" : ""}
        disabled={viewMode === "newStory"}
        onClick={handleChangeToNewStoryViewMode}
      >
        Generate New Story
      </Button>
    </div>
  );
}
