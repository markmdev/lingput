"use client";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
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

  const [showTranslation, setShowTranslation] = useState(false);
  const [wordTranslationsBlurred, setWordTranslationsBlurred] = useState(true);
  const [showLearned, setShowLearned] = useState(false);

  const learningWords = story
    ? story.unknownWords
        .filter((w) => w.status === "learning")
        .sort((a, b) => b.timesSeen - a.timesSeen)
    : [];

  const learnedWords = story
    ? story.unknownWords
        .filter((w) => w.status === "learned")
        .sort((a, b) => b.timesSeen - a.timesSeen)
    : [];
  return (
    <>
      {/* TOP */}
      <div className="">
        <h2 className="font-semibold text-2xl tracking-tight text-slate-900">
          Story #
          {story ? story?.id : <Skeleton circle={true} width={20} height={20} inline={true} />}{" "}
        </h2>
        <hr className="my-4 border-slate-200" />
      </div>
      {/* BOTTOM PART */}
      <SimpleBar autoHide={false} className="flex flex-col gap-6 flex-1 min-h-0">
        {/* TOP PANEL (STORY) */}
        <div className="px-0 lg:px-4 flex flex-col gap-4 w-full">
          <h3 className="font-semibold text-slate-900">Story text</h3>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <p className="leading-relaxed text-slate-800 text-sm lg:text-base">
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
              <p className="text-slate-800 text-sm lg:text-base">
                {story && showTranslation ? story.translationText : <Skeleton count={2} />}
              </p>
            </div>
          )}
        </div>
        {/* <div className="bg-black w-[1px]"></div> */}
        <hr className="border-slate-200" />
        {/* BOTTOM PANEL (VOCABULARY) */}
        <div className="flex flex-col gap-3 px-4 w-full">
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

          {/* Learning group */}
          <div className="flex flex-row items-center justify-between">
            <h4 className="font-semibold text-slate-900">Learning</h4>
            {story && <span className="text-xs text-slate-500">({learningWords.length})</span>}
          </div>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {story
              ? learningWords.map((unknownWord) => (
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

          {/* Learned group */}
          <div className="flex flex-row gap-2 items-center">
            <h4 className="font-semibold text-slate-900">Learned</h4>
            <p
              className={`cursor-pointer py-1 rounded-full font-semibold text-xs px-3 shadow-sm ${
                showLearned ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
              }`}
              onClick={() => setShowLearned(!showLearned)}
            >
              {showLearned ? "Hide" : "Show"}
            </p>
            {story && <span className="text-xs text-slate-500">({learnedWords.length})</span>}
          </div>
          {showLearned && (
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {story
                ? learnedWords.map((unknownWord) => (
                    <UnknownWordComponent
                      key={unknownWord.id}
                      unknownWord={unknownWord}
                      onWordStatusChange={onWordStatusChange}
                      globalBlurState={wordTranslationsBlurred}
                    />
                  ))
                : Array.from({ length: 8 }, (_, index) => (
                    <Skeleton
                      key={index}
                      height={180}
                      baseColor="#eef2ff"
                      highlightColor="#f8fafc"
                    />
                  ))}
            </div>
          )}
        </div>
      </SimpleBar>
      <style jsx>{`
        :global(.simplebar-track.simplebar-vertical) {
          width: 10px;
          background: #f1f5f9; /* slate-100 */
          border-radius: 9999px;
        }
        :global(.simplebar-scrollbar) {
          border-radius: 9999px;
        }
        :global(.simplebar-scrollbar:before) {
          background: #93c5fd; /* blue-300 */
          opacity: 1; /* always visible */
        }
        :global(.simplebar-scrollbar:hover:before) {
          background: #60a5fa; /* blue-400 */
        }
      `}</style>
    </>
  );
}
