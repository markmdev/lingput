import { useState } from "react";
import { Story } from "../types/ApiObjects";
import UnknownWordComponent from "./UnknownWord";

export default function StoryComponent({ story }: { story: Story }) {
  const [showTranslation, setShowTranslation] = useState(false);
  return (
    <div>
      <div>
        <p>{story.storyText}</p>
        <button onClick={() => setShowTranslation(!showTranslation)}>Show Translation</button>
        <p>{showTranslation && story.translationText}</p>
      </div>
      <div>
        <h3>Unknown words</h3>
        {story.unknownWords.map((unknownWord) => (
          <UnknownWordComponent key={unknownWord.id} unknownWord={unknownWord} />
        ))}
      </div>
    </div>
  );
}
