import { ClientApi } from "@/lib/ClientApi";
import { VocabApi } from "../api";
import useSWR from "swr";

export default function useWordsCount() {
  const clientApi = new ClientApi();
  const vocabApi = new VocabApi(clientApi);
  const { data, isLoading, mutate } = useSWR("/api/vocab/words-count", () =>
    vocabApi.getWordsCount()
  );
  return { wordsCount: data, isWordsCountLoading: isLoading, wordsCountUpdate: mutate };
}
