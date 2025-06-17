"use client";

import { useEffect, useState } from "react";
import { VocabAssessmentApi } from "../api";
import { ClientApi } from "@/lib/ClientApi";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { WordRanking } from "../types";

export default function VocabAssessment() {
  const clientApi = new ClientApi();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionUUID = searchParams.get("sessionid");
  const [status, setStatus] = useState<"loading" | "ready" | "started" | "completed">(
    sessionUUID ? "loading" : "ready"
  );
  const [wordsToReview, setWordsToReview] = useState<WordRanking[] | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (sessionUUID) {
        const clientApi = new ClientApi();
        const vocabAssessmentApi = new VocabAssessmentApi(clientApi);
        const result = await vocabAssessmentApi.continue(sessionUUID);
        setStatus("started");
        setWordsToReview(result.wordsToReview || []);
      }
    };
    fetch();
  }, [sessionUUID, status]);

  const handleStart = async () => {
    const vocabAssessmentApi = new VocabAssessmentApi(clientApi);
    const result = await vocabAssessmentApi.start();
    const params = new URLSearchParams(searchParams.toString());
    params.set("sessionid", result.sessionId);
    router.replace(`${window.location.pathname}?${params.toString()}`);
    setStatus("started");
    setWordsToReview(result.wordsToReview || []);
  };

  return (
    <div>
      <h1>Vocabulary Assessment</h1>
      {status === "loading" && (
        <div>
          <p>Loading...</p>
        </div>
      )}
      {status === "ready" && (
        <div className="">
          <button className="py-1 px-2 text-lg bg-green-400 font-bold" onClick={handleStart}>
            Start
          </button>
        </div>
      )}
      {status === "started" && (
        <div className="">
          <p>Started</p>
          <div className="">
            {wordsToReview?.map((item) => (
              <div className="" key={item.id}>
                {item.word}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
