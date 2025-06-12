import { useState } from "react";
import { Story } from "@/feautures/story/types";
import UnknownWordComponent from "@/feautures/unknownWord/components/UnknownWord";
import { EnvError } from "@/types/EnvError";
import Skeleton from "react-loading-skeleton";
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

  if (story) {
    story.unknownWords = story.unknownWords.sort((a, b) => {
      if (a.status === "learning" && b.status === "learned") return -1;
      if (a.status === "learned" && b.status === "learning") return 1;

      return b.timesSeen - a.timesSeen;
    });
  }

  const [showTranslation, setShowTranslation] = useState(false);
  return (
    <>
      {/* TOP */}
      <div className="">
        <h2 className="font-semibold text-2xl">
          Story #{story ? story?.id : <Skeleton circle={true} width={20} height={20} inline={true} />} details
        </h2>
        <hr className="my-4" />
      </div>
      {/* BOTTOM PART */}
      <div className="flex flex-col gap-6 flex-1 overflow-hidden">
        {/* TOP PANEL (STORY) */}
        <div className="px-4 flex flex-col gap-3 w-full">
          <h3 className="font-semibold">Story text</h3>
          <div className="p-2 bg-blue-50 rounded-lg border-blue-100 border">
            <p>{story ? story.storyText : <Skeleton count={3} />}</p>
          </div>
          <h3 className="font-semibold">Listen</h3>
          {story ? (
            <audio controls className="w-1/2">
              <source src={`${audioBucketUrl}${story.audioUrl}`} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <Skeleton height={40} />
          )}

          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="px-4 py-2 rounded-xl font-semibold cursor-pointer w-fit text-white bg-linear-65 from-purple-700 to-purple-400"
          >
            {showTranslation ? "Hide Translation" : "Show Translation"}
          </button>
          {showTranslation && (
            <div className="p-2 bg-blue-50 rounded-lg border-blue-100 border">
              <p>{story && showTranslation ? story.translationText : <Skeleton count={2} />}</p>
            </div>
          )}
        </div>
        {/* <div className="bg-black w-[1px]"></div> */}
        <hr />
        {/* BOTTOM PANEL (VOCABULARY) */}
        <div className="flex flex-col gap-3 px-4 w-full overflow-y-auto">
          <h3 className="font-semibold">Vocabulary</h3>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {story ? (
              story.unknownWords.map((unknownWord) => (
                <UnknownWordComponent
                  key={unknownWord.id}
                  unknownWord={unknownWord}
                  onWordStatusChange={onWordStatusChange}
                />
              ))
            ) : (
              <Skeleton count={8} height={90} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
