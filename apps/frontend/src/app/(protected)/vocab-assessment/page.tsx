"use client";

import { useEffect, useState } from "react";
import { ClientApi } from "@/lib/ClientApi";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { VocabAssessmentApi } from "@/features/vocabAssessment/api";
import Word from "@/features/vocabAssessment/components/Word";
import { AssessmentResponse } from "@/features/vocabAssessment/types";
import ContinueButton from "@/features/vocabAssessment/components/ContinueButton";
import StartButton from "@/features/vocabAssessment/components/StartButton";
import { ApiError } from "@/types/ApiError";

export default function VocabAssessmentPage() {
  const clientApi = new ClientApi();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionUUID = searchParams.get("sessionid");
  const [status, setStatus] = useState<"loading" | "ready" | "started" | "completed">(
    sessionUUID ? "loading" : "ready"
  );

  const [apiResponse, setApiResponse] = useState<AssessmentResponse | null>(null);
  const [answer, setAnswer] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetch = async () => {
      if (sessionUUID && apiResponse === null) {
        const clientApi = new ClientApi();
        const vocabAssessmentApi = new VocabAssessmentApi(clientApi);
        const result = await vocabAssessmentApi.continue(sessionUUID);
        setApiResponse(result);
        if (result.status === "active") {
          setStatus("started");
        } else if (result.status === "completed") {
          setStatus("completed");
        }
      }
    };
    fetch();
  }, [sessionUUID, apiResponse]);

  const handleStart = async () => {
    try {
      const vocabAssessmentApi = new VocabAssessmentApi(clientApi);
      const result = await vocabAssessmentApi.start();
      const params = new URLSearchParams(searchParams.toString());
      params.set("sessionid", result.sessionId);
      router.replace(`${window.location.pathname}?${params.toString()}`);
      setStatus("started");
      setApiResponse(result);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        (error as { statusCode?: number }).statusCode === 401
      ) {
        router.replace("/login");
      }
    }
  };

  const handleContinue = async () => {
    try {
      if (!sessionUUID) return;
      if (Object.keys(answer).length !== apiResponse?.wordsToReview?.length) return;
      setStatus("loading");
      const vocabAssessmentApi = new VocabAssessmentApi(clientApi);
      const result = await vocabAssessmentApi.continue(sessionUUID, answer);
      setApiResponse(result);
      setAnswer({});
      if (result.status === "active") {
        setStatus("started");
      } else if (result.status === "completed") {
        setStatus("completed");
      }
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        router.replace("/login");
      } else {
        console.error(error);
        throw new Error("Unexpected server error");
      }
    }
  };

  const handleWordAnswer = (wordId: number, result: boolean) => {
    setAnswer((oldAnswer) => ({ ...oldAnswer, [wordId]: result }));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="px-6 py-20 bg-white/80 backdrop-blur-sm border border-slate-100 flex flex-col items-center rounded-2xl w-full md:w-2/3 lg:w-1/2 shadow-sm mx-auto">
        <h1 className="text-xl font-semibold text-slate-900">Vocabulary Assessment</h1>
        {status === "loading" && (
          <div className="py-6">
            <p className="text-slate-600">Loading...</p>
          </div>
        )}

        {status === "ready" && (
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
          <div className="py-6">
            <p className="font-semibold text-lg text-slate-900">
              Vocabulary size: {apiResponse?.vocabularySize}
            </p>
            <button className="py-2.5 px-6 text-lg font-semibold rounded-lg w-fit bg-emerald-500 cursor-pointer text-white hover:bg-emerald-600 transition-colors">
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
