import { useState } from "react";
import { Story } from "../types/ApiObjects";
import UnknownWordComponent from "./UnknownWord";

export default function StoryComponent({ story }: { story: Story | null }) {
  const [showTranslation, setShowTranslation] = useState(false);
  return (
    <div className="border-1 p-4 flex flex-row gap-6 w-2/3">
      {story && (
        <>
          <div className="flex-1/3 p-4">
            <p>{story.storyText}</p>
            <audio controls>
              <source src="your-audio-file.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>

            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="border-2 px-4 py-2 rounded-xl font-bold cursor-pointer"
            >
              Show Translation
            </button>
            <p>{showTranslation && story.translationText}</p>
          </div>
          <div className="flex flex-col p-4">
            <h3>Unknown words</h3>
            {story.unknownWords.map((unknownWord) => (
              <UnknownWordComponent key={unknownWord.id} unknownWord={unknownWord} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
