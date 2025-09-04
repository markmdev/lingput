"use client";

import useWordsCount from "@/features/vocab/hooks/useWordsCount";
import { VocabAssessmentApi } from "@/features/vocabAssessment/api";
import { ClientApi } from "@/lib/ClientApi";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function SkipVocabAssessmentPage() {
  const { wordsCountUpdate } = useWordsCount();
  const clientApi = new ClientApi();
  const vocabAssessmentApi = new VocabAssessmentApi(clientApi);
  const router = useRouter();

  const called = useRef(false);
  useEffect(() => {
    if (called.current) return;
    called.current = true;
    const skip = async () => {
      await vocabAssessmentApi.skip();
      wordsCountUpdate();
      router.replace("/dashboard");
    };

    skip();
  }, [router]);

  return <p>Loading...</p>;
}
