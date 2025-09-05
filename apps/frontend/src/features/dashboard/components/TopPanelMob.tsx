import Button from "@/components/Button";
import Image from "next/image";

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
        <p className="text-2xl font-bold text-slate-900">
          <Image
            src="/logo_min.png"
            alt="Lingput Logo"
            className="h-12 w-auto inline-block align-middle"
          />
        </p>
      </div>
    </div>
  );
}
