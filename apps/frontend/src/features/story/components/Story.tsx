import { useState } from "react";
import { Story } from "@/features/story/types";
import UnknownWordComponent from "@/features/unknownWord/components/UnknownWord";
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
  const [wordTranslationsBlurred, setWordTranslationsBlurred] = useState(true);
  return (
    <>
      {/* TOP */}
      <div className="">
        <h2 className="font-semibold text-2xl tracking-tight text-slate-900">
          Story #
          {story ? story?.id : <Skeleton circle={true} width={20} height={20} inline={true} />}{" "}
          details
        </h2>
        <hr className="my-4 border-slate-200" />
      </div>
      {/* BOTTOM PART */}
      <div className="flex flex-col gap-6 flex-1 overflow-hidden">
        {/* TOP PANEL (STORY) */}
        <div className="px-4 flex flex-col gap-4 w-full">
          <h3 className="font-semibold text-slate-900">Story text</h3>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <p className="leading-relaxed text-slate-800">
              {story ? story.storyText : <Skeleton count={3} />}
            </p>
          </div>
          <h3 className="font-semibold text-slate-900">Listen</h3>
          {story ? (
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm w-full lg:w-1/2">
              <audio controls className="w-full" key={story.id}>
                <source src={`${audioBucketUrl}${story.audioUrl}`} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <Skeleton height={40} />
          )}

          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="px-4 py-2 rounded-full font-semibold cursor-pointer w-fit text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-800 hover:to-purple-600 shadow-sm"
          >
            {showTranslation ? "Hide Translation" : "Show Translation"}
          </button>
          {showTranslation && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-800">
                {story && showTranslation ? story.translationText : <Skeleton count={2} />}
              </p>
            </div>
          )}
        </div>
        {/* <div className="bg-black w-[1px]"></div> */}
        <hr className="border-slate-200" />
        {/* BOTTOM PANEL (VOCABULARY) */}
        <div className="flex flex-col gap-3 px-4 w-full overflow-y-auto">
          <div className="flex flex-row gap-2 items-center">
            <h3 className="font-semibold text-xl text-slate-900">Vocabulary</h3>
            {wordTranslationsBlurred && (
              <p
                className="cursor-pointer bg-emerald-500 text-white py-1 rounded-full font-semibold text-xs px-3 shadow-sm"
                onClick={() => setWordTranslationsBlurred(false)}
              >
                Show All Translations
              </p>
            )}
            {!wordTranslationsBlurred && (
              <p
                className="cursor-pointer bg-rose-500 text-white py-1 rounded-full font-semibold text-xs px-3 shadow-sm"
                onClick={() => setWordTranslationsBlurred(true)}
              >
                Hide All Translations
              </p>
            )}
          </div>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {story
              ? story.unknownWords.map((unknownWord) => (
                  <UnknownWordComponent
                    key={unknownWord.id}
                    unknownWord={unknownWord}
                    onWordStatusChange={onWordStatusChange}
                    globalBlurState={wordTranslationsBlurred}
                  />
                ))
              : Array.from({ length: 8 }, (_, index) => (
                  <Skeleton key={index} height={180} baseColor="#eef2ff" highlightColor="#f8fafc" />
                ))}
          </div>
        </div>
      </div>
    </>
  );
}
