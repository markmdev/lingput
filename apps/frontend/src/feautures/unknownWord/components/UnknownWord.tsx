import { useState } from "react";
import { UnknownWord } from "../types";

export default function UnknownWordComponent({
  unknownWord,
  onWordStatusChange,
}: {
  unknownWord: UnknownWord;
  onWordStatusChange: (wordId: number, newStatus: "learned" | "learning") => void;
}) {
  const [isLearnedButtonLoading, setIsLearnedButtonLoading] = useState(false);
  const [isLearningButtonLoading, setIsLearningButtonLoading] = useState(false);
  const handleMarkAsLearned = async () => {
    setIsLearnedButtonLoading(true);
    await onWordStatusChange(unknownWord.id, "learned");
    setIsLearnedButtonLoading(false);
  };

  const handleMarkAsLearning = async () => {
    setIsLearningButtonLoading(true);
    await onWordStatusChange(unknownWord.id, "learning");
    setIsLearningButtonLoading(false);
  };
  return (
    <div className="border border-gray-300 py-2 px-4 lg:p-4 rounded-lg flex flex-col gap-2">
      <div>
        <p>
          <span className="text-gray-500">{unknownWord.article}</span>{" "}
          <span className="font-bold">{unknownWord.word}</span>
        </p>
        <p className="text-gray-500">{unknownWord.translation}</p>
      </div>
      <div className="text-sm border-t-[1px] border-gray-200 pt-3">
        <p>
          <b className="text-purple-500">Example:</b> {unknownWord.exampleSentence}
        </p>
        <p className="italic text-gray-500">&quot;{unknownWord.exampleSentenceTranslation}&quot;</p>
      </div>
      <div className="flex flex-row justify-between text-xs mt-auto border-t-[1px] border-gray-200 pt-3">
        <div className="flex flex-row sm:flex-col gap-2 sm:gap-0 items-center sm:items-start">
          <p>
            Status:{" "}
            <span
              className={`uppercase font-semibold ${
                unknownWord.status.toLowerCase() === "learned" ? "text-green-400" : "text-orange-400"
              }`}
            >
              {unknownWord.status}
            </span>
          </p>
          <p className="text-sm text-gray-500">(Seen: {unknownWord.timesSeen})</p>
        </div>
        <div className="flex flex-row sm:flex-col gap-1 text-xs self-center">
          <button
            onClick={handleMarkAsLearned}
            className="py-1 px-2 h-fit bg-green-400 text-white font-bold rounded-lg cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isLearnedButtonLoading}
          >
            Learned
          </button>
          <button
            onClick={handleMarkAsLearning}
            className="py-1 px-2 bg-gray-200 text-black font-semibold rounded-lg cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isLearningButtonLoading}
          >
            Learning
          </button>
        </div>
      </div>
    </div>
  );
}
