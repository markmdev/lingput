import Word from "@/features/vocabAssessment/components/Word";
import ContinueButton from "@/features/vocabAssessment/components/ContinueButton";
import StartButton from "@/features/vocabAssessment/components/StartButton";
import { AssessmentResponse } from "@/features/vocabAssessment/types";

type AssessmentStatus = "loading" | "ready" | "started" | "completed";

interface VocabAssessmentProps {
  status: AssessmentStatus;
  isLoading: boolean;
  wordsCount?: number;
  apiResponse: AssessmentResponse | null;
  answer: Record<number, boolean>;
  handleStart: () => void;
  handleContinue: () => void;
  handleWordAnswer: (wordId: number, result: boolean) => void;
}

export default function VocabAssessment({
  status,
  isLoading,
  wordsCount,
  apiResponse,
  answer,
  handleStart,
  handleContinue,
  handleWordAnswer,
}: VocabAssessmentProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="px-6 py-20 bg-white/80 backdrop-blur-sm border border-slate-100 flex flex-col items-center rounded-2xl w-full md:w-2/3 lg:w-1/2 shadow-sm mx-auto">
        <h1 className="text-xl font-semibold text-slate-900">Vocabulary Assessment</h1>
        {(status === "loading" || isLoading) && (
          <div className="py-6">
            <p className="text-slate-600">Loading...</p>
          </div>
        )}

        {status === "ready" && !isLoading && wordsCount === 0 && (
          <div className="py-4 flex flex-col items-center">
            <p className="text-slate-700 text-center mt-2 mb-6 max-w-xl">
              To provide you with the most effective and personalized stories, we first need to
              understand your current vocabulary knowledge. This quick assessment helps us tailor
              content to your level, ensuring you get the right amount of challenge and support as
              you learn. Please answer honestly for the best experience!
            </p>
            <StartButton onClick={handleStart} />
          </div>
        )}

        {status === "started" && (
          <div className="flex flex-col gap-4 items-center w-full">
            <p className="text-slate-700">
              Step {apiResponse?.step}{" "}
              {apiResponse?.lastStep ? <span className="italic">(Last)</span> : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
              {apiResponse?.wordsToReview?.map((item) => (
                <Word
                  key={item.id}
                  word={item}
                  answer={handleWordAnswer}
                  status={answer[item.id]}
                />
              ))}
            </div>
            <ContinueButton
              isActive={Object.keys(answer).length !== apiResponse?.wordsToReview?.length}
              onClick={handleContinue}
            />
          </div>
        )}

        {status === "completed" && (
          <div className="py-6 flex flex-col items-center justify-center">
            <form action="/dashboard">
              <p>Vocabulary Assessment completed!</p>
              <button
                type="submit"
                className="py-2.5 px-6 text-lg font-semibold rounded-lg w-fit bg-emerald-500 cursor-pointer text-white hover:bg-emerald-600 transition-colors"
              >
                Continue
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
