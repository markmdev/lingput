import { Story } from "../types/ApiObjects";

export default function StoryPreview({ story }: { story: Story }) {
  return (
    <div>
      <p>ID: {story.id}</p>
      <p>{story.storyText.slice(0, 50)}...</p>
    </div>
  );
}
