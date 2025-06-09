import { ClientApi } from "@/lib/ClientApi";
import { UnknownWordApi } from "../api";
import { UnknownWord } from "../types";
import { ApiError } from "@/types/ApiError";
import { toast } from "react-toastify";

export default function UnknownWordComponent({
  unknownWord,
  onWordStatusChange,
}: {
  unknownWord: UnknownWord;
  onWordStatusChange: (wordId: number, newStatus: "learned" | "learning") => void;
}) {
  const clientApi = new ClientApi();
  const unknownWordApi = new UnknownWordApi(clientApi);

  const handleMarkAsLearned = async () => {
    try {
      await unknownWordApi.markAsLearned(unknownWord.id);
      onWordStatusChange(unknownWord.id, "learned");
    } catch (error) {
      if (error instanceof ApiError) {
        toast(error.message);
      } else {
        toast("Unknown error happened");
      }
    }
  };

  const handleMarkAsLearning = async () => {
    try {
      await unknownWordApi.markAsLearning(unknownWord.id);
      onWordStatusChange(unknownWord.id, "learning");
    } catch (error) {
      if (error instanceof ApiError) {
        toast(error.message);
      } else {
        toast("Unknown error happened");
      }
    }
  };
  return (
    <div className="border border-gray-300 p-4 rounded-lg flex flex-col gap-2">
      <div>
        <p>
          <span className="text-gray-500">{unknownWord.article}</span>{" "}
          <span className="font-bold">{unknownWord.word}</span>
        </p>
        <p className="text-gray-500">{unknownWord.translation}</p>
      </div>
      <div className="text-sm border-[1px] border-r-0 border-l-0 border-gray-200 py-3">
      <p>
        <b className="text-purple-500">Example:</b> {unknownWord.exampleSentence}
      </p>
      <p className="italic text-gray-500">
        "{unknownWord.exampleSentenceTranslation}"
      </p>
      </div>
      <div className="flex flex-row justify-between text-xs">
        <p>Status: <span className={`uppercase font-semibold text-${unknownWord.status === "learned" ? 'green-400' : 'orange-400'}`}>{unknownWord.status}</span> <span className="text-sm text-gray-500">(Seen: {unknownWord.timesSeen})</span></p>
        <div className="flex flex-row gap-2 text-xs self-center">
        <button onClick={handleMarkAsLearned} className="py-1 px-2 h-fit bg-green-400 text-white font-bold rounded-lg cursor-pointer">
          Learned
        </button>
        <button onClick={handleMarkAsLearning} className="py-1 px-2 bg-gray-200 text-black font-semibold rounded-lg cursor-pointer">
          Learning
        </button>
        </div>
      </div>
    </div>
  );
}
