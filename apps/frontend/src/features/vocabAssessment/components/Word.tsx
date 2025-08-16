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
  const yesSelected = status === true;
  const noSelected = status === false;
  return (
    <div
      className={`py-3 px-3 border rounded-xl flex flex-col shadow-sm transition-colors border-slate-200 bg-white ${
        yesSelected ? "ring-2 ring-emerald-400" : noSelected ? "ring-2 ring-rose-400" : ""
      }`}
    >
      <div className="mb-2">
        <p className="font-semibold text-slate-900">{word.word}</p>
        <p className="italic text-slate-600">{word.translation}</p>
      </div>
      <div className={`flex flex-col justify-center mt-auto gap-2`}>
        <button
          className={`py-1.5 px-2.5 border-2 font-semibold text-sm rounded-lg text-white cursor-pointer shadow-sm transition-all ${
            yesSelected
              ? "bg-emerald-700 border-emerald-700"
              : "bg-emerald-500 border-emerald-600 hover:bg-emerald-600"
          }`}
          onClick={() => answer(word.id, true)}
        >
          I know this word
        </button>
        <button
          className={`py-1.5 px-2.5 border-2 font-semibold text-sm rounded-lg text-white cursor-pointer shadow-sm transition-all ${
            noSelected
              ? "bg-rose-700 border-rose-700"
              : "bg-rose-500 border-rose-600 hover:bg-rose-600"
          }`}
          onClick={() => answer(word.id, false)}
        >
          I don&apos;t know this word
        </button>
      </div>
    </div>
  );
}
