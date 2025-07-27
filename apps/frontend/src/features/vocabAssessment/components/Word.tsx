import { WordRanking } from "../types";

export default function Word({
  word,
  answer,
  status,
}: {
  word: WordRanking;
  answer: (wordId: number, result: boolean) => void;
  status: boolean;
}) {
  return (
    <div
      className={`py-1 px-2 border rounded-lg flex flex-col ${
        status === true ? "bg-green-100" : status === false ? "bg-red-100" : ""
      }`}
    >
      <div className="mb-2">
        <p className="font-bold">{word.word}</p>
        <p className="italic">{word.translation}</p>
      </div>
      <div className={`flex flex-col justify-center mt-auto gap-2`}>
        <button
          className={`py-1 px-2 border-gray-300 border-2 font-bold text-sm rounded-lg text-white cursor-pointer ${
            status === true ? "bg-green-700" : "bg-green-500 shadow-lg"
          }`}
          onClick={() => answer(word.id, true)}
        >
          I know this word
        </button>
        <button
          className={`py-1 px-2 border-gray-300 border-2 font-bold text-sm rounded-lg text-white cursor-pointer ${
            status === false ? "bg-red-700" : "bg-red-500 shadow-lg"
          }`}
          onClick={() => answer(word.id, false)}
        >
          I don&apos;t know this word
        </button>
      </div>
    </div>
  );
}
