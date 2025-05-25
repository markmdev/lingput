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
      <hr className="bg-gray-200" />
      <p>
        <b>Times seen:</b> {unknownWord.timesSeen}
      </p>
      <p>
        <b>Example:</b> {unknownWord.exampleSentence}
      </p>
      <p>
        <b>Example translation:</b> {unknownWord.exampleSentenceTranslation}
      </p>
      <p>
        <b>Status:</b> {unknownWord.status}
        <button onClick={handleMarkAsLearned} className="py-2 px-4 border">
          Learned
        </button>
        <button onClick={handleMarkAsLearning} className="py-2 px-4 border">
          Learning
        </button>
      </p>
    </div>
  );
}
