import Button from "./Button";

export default function TopPanelMob({
  viewMode,
  onChangeToNewStoryViewMode,
  onChangeToAllStoriesViewMode,
}: {
  viewMode: "newStory" | "chosenStory" | "allStories";
  onChangeToNewStoryViewMode: () => void;
  onChangeToAllStoriesViewMode: () => void;
}) {
  return (
    <div className="flex flex-row bg-white mb-2 p-2 lg:hidden justify-between items-center">
      <div className="flex flex-row gap-4">
        <Button onClick={onChangeToAllStoriesViewMode}>Stories</Button>
        <Button
          styles={viewMode === "newStory" ? "bg-gray-500 cursor-not-allowed" : ""}
          disabled={viewMode === "newStory"}
          onClick={onChangeToNewStoryViewMode}
        >
          Generate New Story
        </Button>
      </div>
      <div className="mr-4">
        <p className="font-bold text-3xl">LOGO</p>
      </div>
    </div>
  );
}
