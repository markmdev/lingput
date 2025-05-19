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
    <div className="flex flex-col gap-4 py-8 px-6">
      {story && (
        <>
          {/* TOP */}
          <div className="">
            <h2 className="font-semibold text-2xl">Story #{story?.id} details</h2>
            <hr className="my-4" />
          </div>
          {/* BOTTOM */}
          <div className="flex flex-row gap-6">
            {/* LEFT PANEL */}
            <div className="px-4 flex flex-col gap-3">
              <h3 className="font-semibold">Story text</h3>
              <div className="p-2 bg-blue-50 rounded-lg border-blue-100 border">
                <p>{story.storyText}</p>
              </div>
              <h3 className="font-semibold">Listen</h3>
              <audio controls>
                <source src={`${audioBucketUrl}${story.audioUrl}`} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>

              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="px-4 py-2 rounded-xl font-semibold cursor-pointer w-fit text-white bg-linear-65 from-purple-700 to-purple-400"
              >
                {showTranslation ? "Hide Translation" : "Show Translation"}
              </button>
              {showTranslation && (
                <div className="p-2 bg-blue-50 rounded-lg border-blue-100 border">
                  <p>{showTranslation && story.translationText}</p>
                </div>
              )}
            </div>
            <div className="bg-black w-[1px]"></div>
            {/* RIGHT PANEL */}
            <div className="flex flex-col gap-3 px-4 w-2/3">
              <h3 className="font-semibold">Vocabulary</h3>
              {story.unknownWords.map((unknownWord) => (
                <UnknownWordComponent
                  key={unknownWord.id}
                  unknownWord={unknownWord}
                  onWordStatusChange={onWordStatusChange}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
