import { ClientApi } from "@/lib/ClientApi";
import { UnknownWordApi } from "../api";
import { UnknownWord } from "../types";

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
    await unknownWordApi.markAsLearned(unknownWord.id);
    onWordStatusChange(unknownWord.id, "learned");
  };

  const handleMarkAsLearning = async () => {
    await unknownWordApi.markAsLearning(unknownWord.id);
    onWordStatusChange(unknownWord.id, "learning");
  };

  return (
    <div className="border-1 p-2">
      <p>
        <b>Word:</b> {unknownWord.word}
      </p>
      <p>
        <b>Translation:</b> {unknownWord.translation}
      </p>
      <p>
        <b>Article:</b> {unknownWord.article}
      </p>
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
        <button onClick={handleMarkAsLearned} className="py-2 px-4 border-1">
          Learned
        </button>
        <button onClick={handleMarkAsLearning} className="py-2 px-4 border-1">
          Learning
        </button>
      </p>
    </div>
  );
}
