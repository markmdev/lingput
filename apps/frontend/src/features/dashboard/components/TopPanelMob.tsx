import Button from "@/components/Button";

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
    <div className="flex flex-row bg-white/80 backdrop-blur-sm mb-2 p-3 lg:hidden justify-between items-center rounded-xl border border-slate-100 shadow-sm">
      <div className="flex flex-row gap-3">
        <Button variant="secondary" size="sm" onClick={onChangeToAllStoriesViewMode}>
          Stories
        </Button>
        <Button
          variant={viewMode === "newStory" ? "secondary" : "primary"}
          size="sm"
          styles={viewMode === "newStory" ? "cursor-not-allowed" : ""}
          disabled={viewMode === "newStory"}
          onClick={onChangeToNewStoryViewMode}
        >
          Generate New Story
        </Button>
      </div>
      <div className="mr-2">
        <p className="font-extrabold text-2xl tracking-tight text-slate-900">
          comp<span className="text-indigo-600">input</span>
        </p>
      </div>
    </div>
  );
}
