"use client";

import { useEffect, useState } from "react";
import { ClientApi } from "@/lib/ClientApi";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { VocabAssessmentApi } from "@/feautures/vocabAssessment/api";
import Word from "@/feautures/vocabAssessment/components/Word";
import { AssessmentResponse } from "@/feautures/vocabAssessment/types";
import ContinueButton from "@/feautures/vocabAssessment/components/ContinueButton";
import StartButton from "@/feautures/vocabAssessment/components/StartButton";
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
        error.statusCode === 401
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
    <div className="p-6 bg-gray-50 border-2 border-gray-300 flex flex-col items-center rounded-lg w-1/2">
      <h1 className="text-xl font-semibold">Vocabulary Assessment</h1>
      {status === "loading" && (
        <div>
          <p>Loading...</p>
        </div>
      )}

      {status === "ready" && (
        <div className="">
          <StartButton onClick={handleStart} />
        </div>
      )}

      {status === "started" && (
        <div className="flex flex-col gap-4 items-center">
          <p>
            Step {apiResponse?.step}{" "}
            {apiResponse?.lastStep ? <span className="italic">(Last)</span> : ""}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {apiResponse?.wordsToReview?.map((item) => (
              <Word key={item.id} word={item} answer={handleWordAnswer} status={answer[item.id]} />
            ))}
          </div>
          <ContinueButton
            isActive={Object.keys(answer).length !== apiResponse?.wordsToReview?.length}
            onClick={handleContinue}
          />
        </div>
      )}

      {status === "completed" && (
        <div className="">
          <p className="text-semibold text-lg">Vocabulary size: {apiResponse?.vocabularySize}</p>
          <button className="py-2 px-6 text-xl font-semibold border rounded-sm flex-shrink w-fit bg-green-400 cursor-pointer text-white">
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
