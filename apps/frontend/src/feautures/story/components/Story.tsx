import { useState } from "react";
import { Story } from "@/feautures/story/types";
import UnknownWordComponent from "@/feautures/unknownWord/components/UnknownWord";
import { EnvError } from "@/types/EnvError";
export default function StoryComponent({
  story,
  onWordStatusChange,
}: {
  story: Story | null;
  onWordStatusChange: (wordId: number, newStatus: "learned" | "learning") => void;
}) {
  const audioBucketUrl = process.env.NEXT_PUBLIC_AUDIO_BUCKET_URL;
  if (!audioBucketUrl) {
    throw new EnvError("NEXT_PUBLIC_AUDIO_BUCKET_URL env variable is not set.");
  }

  const [showTranslation, setShowTranslation] = useState(false);
  return (
    <div className="border p-4 flex flex-row gap-6 w-2/3">
      {story && (
        <>
          <div className="p-4">
            <p>{story.storyText}</p>
            <audio controls>
              <source src={`${audioBucketUrl}${story.audioUrl}`} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>

            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="border-2 px-4 py-2 rounded-xl font-bold cursor-pointer"
            >
              {showTranslation ? "Hide Translation" : "Show Translation"}
            </button>
            <p>{showTranslation && story.translationText}</p>
          </div>
          <div className="flex flex-col p-4 w-2/3">
            <h3>Unknown words</h3>
            {story.unknownWords.map((unknownWord) => (
              <UnknownWordComponent
                key={unknownWord.id}
                unknownWord={unknownWord}
                onWordStatusChange={onWordStatusChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
