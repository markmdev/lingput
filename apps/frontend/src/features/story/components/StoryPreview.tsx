import { Story } from "@/features/story/types";

export default function StoryPreview({
  story,
  isSelected = false,
}: {
  story: Story;
  isSelected?: boolean;
}) {
  const selectedStyles = "border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-50 to-white";
  return (
    <div
      className={`text-sm rounded-xl p-3 border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm ${
        isSelected ? selectedStyles : "border-transparent"
      }`}
    >
      <p className={`${isSelected ? "text-indigo-700" : "text-slate-900"} font-medium`}>
        Story #{story.id}
      </p>
      <p className="text-xs text-slate-500 truncate">{story.storyText.slice(0, 70)}...</p>
    </div>
  );
}
