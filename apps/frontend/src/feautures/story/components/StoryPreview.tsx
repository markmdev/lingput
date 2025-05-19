import { Story } from "@/feautures/story/types";

export default function StoryPreview({ story, isSelected = false }: { story: Story; isSelected?: boolean }) {
  const selectedStyles = "border-l-blue-500 bg-linear-to-r from-blue-100 to-white";
  return (
    <div className={`text-sm border-l-4 rounded-lg p-2 border-transparent ${isSelected && selectedStyles}`}>
      <p className={`${isSelected ? "text-blue-700" : "text-black"}`}>Story #{story.id}</p>
      <p className="text-xs text-gray-500">{story.storyText.slice(0, 70)}...</p>
    </div>
  );
}
