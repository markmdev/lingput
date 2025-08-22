"use client";

import { useEffect, useState } from "react";
import { ClientApi } from "@/lib/ClientApi";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { VocabAssessmentApi } from "@/features/vocabAssessment/api";
import { AssessmentResponse } from "@/features/vocabAssessment/types";
import { ApiError } from "@/types/ApiError";
import VocabAssessment from "@/components/VocabAssessment";
import useWordsCount from "@/features/vocab/hooks/useWordsCount";

export default function VocabAssessmentPage() {
  const clientApi = new ClientApi();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionUUID = searchParams.get("sessionid");
  const [status, setStatus] = useState<"loading" | "ready" | "started" | "completed">(
    sessionUUID ? "loading" : "ready"
  );

  const { wordsCount, isLoading } = useWordsCount();
  const [apiResponse, setApiResponse] = useState<AssessmentResponse | null>(null);
  const [answer, setAnswer] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (typeof wordsCount === "number" && wordsCount !== 0) {
      router.replace("/dashboard");
    }
  }, [wordsCount, router]);

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
    <VocabAssessment
      status={status}
      isLoading={isLoading}
      wordsCount={wordsCount}
      apiResponse={apiResponse}
      answer={answer}
      handleStart={handleStart}
      handleContinue={handleContinue}
      handleWordAnswer={handleWordAnswer}
    />
  );
}
