import { useEffect, useState } from "react";
import { UnknownWord } from "../types";

export default function UnknownWordComponent({
  unknownWord,
  onWordStatusChange,
  globalBlurState,
}: {
  unknownWord: UnknownWord;
  onWordStatusChange: (wordId: number, newStatus: "learned" | "learning") => void;
  globalBlurState: boolean;
}) {
  const [isBlurred, setIsBlurred] = useState(true);
  const [isLearnedButtonLoading, setIsLearnedButtonLoading] = useState(false);
  const [isLearningButtonLoading, setIsLearningButtonLoading] = useState(false);
  const handleMarkAsLearned = async () => {
    setIsLearnedButtonLoading(true);
    await onWordStatusChange(unknownWord.id, "learned");
    setIsLearnedButtonLoading(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("onboarding:wordMarked", { detail: { status: "learned" } })
      );
    }
  };

  const handleMarkAsLearning = async () => {
    setIsLearningButtonLoading(true);
    await onWordStatusChange(unknownWord.id, "learning");
    setIsLearningButtonLoading(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("onboarding:wordMarked", { detail: { status: "learning" } })
      );
    }
  };

  useEffect(() => {
    setIsBlurred(globalBlurState);
  }, [globalBlurState]);

  const statusColor =
    unknownWord.status.toLowerCase() === "learned"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <div className="border border-slate-200 bg-white py-3 px-4 rounded-xl flex flex-col gap-2 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-start justify-between">
        <p>
          <span className="text-slate-500">{unknownWord.article}</span>{" "}
          <span className="font-semibold text-slate-900">{unknownWord.word}</span>
        </p>
        <span
          className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}
        >
          {unknownWord.status}
        </span>
      </div>
      <div>
        <p
          className={`text-slate-500 cursor-pointer transition-all ${isBlurred ? "blur-xs" : ""}`}
          onClick={() => setIsBlurred(!isBlurred)}
        >
          {unknownWord.translation}
        </p>
      </div>
      <div className="text-sm border-t border-slate-200 pt-3">
        <p>
          <b className="text-purple-600">Example:</b> {unknownWord.exampleSentence}
        </p>
        <p
          className={`italic text-slate-500 cursor-pointer transition-all ${
            isBlurred ? "blur-xs" : ""
          }`}
          onClick={() => setIsBlurred(!isBlurred)}
        >
          &quot;{unknownWord.exampleSentenceTranslation}&quot;
        </p>
      </div>
      <div className="flex flex-row justify-between text-xs mt-auto border-t border-slate-200 pt-3">
        <div className="flex flex-row sm:flex-col gap-2 sm:gap-0 items-center sm:items-start">
          <p>
            Status:{" "}
            <span
              className={`uppercase font-semibold ${
                unknownWord.status.toLowerCase() === "learned"
                  ? "text-emerald-500"
                  : "text-amber-500"
              }`}
            >
              {unknownWord.status}
            </span>
          </p>
          <p className="text-sm text-slate-500">(Seen: {unknownWord.timesSeen})</p>
        </div>
        <div className="flex flex-row sm:flex-col gap-1 text-xs self-center">
          <button
            onClick={handleMarkAsLearned}
            className="py-1.5 px-2.5 h-fit bg-emerald-500 text-white font-semibold rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            disabled={isLearnedButtonLoading}
            data-onboarding="word-learned-button"
          >
            Learned
          </button>
          <button
            onClick={handleMarkAsLearning}
            className="py-1.5 px-2.5 bg-slate-100 text-slate-900 font-semibold rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-slate-200"
            disabled={isLearningButtonLoading}
            data-onboarding="word-learning-button"
          >
            Learning
          </button>
        </div>
      </div>
    </div>
  );
}
