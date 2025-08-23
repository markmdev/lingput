import { useCallback, useMemo } from "react";
import { Story } from "@/features/story/types";
import { UnknownWordApi } from "@/features/unknownWord/api";
import { ClientApi } from "@/lib/ClientApi";
import { JobStarter, handleJob } from "@/lib/jobHandler";
import { toast } from "react-toastify";
import { KeyedMutator } from "swr";

export function useWordStatus(chosenStory: Story | null, mutate: KeyedMutator<Story[]>) {
  const clientApi = useMemo(() => new ClientApi(), []);
  const unknownWordApi = useMemo(() => new UnknownWordApi(clientApi), [clientApi]);

  const updateCurrentDataWithNewWordStatus = useCallback(
    (currentData: Story[] | undefined, wordId: number, newStatus: "learned" | "learning") => {
      if (!currentData || !chosenStory) return currentData;
      console.log(currentData);
      return currentData.map((story) => {
        if (story.id !== chosenStory?.id) {
          return story;
        }
        return {
          ...story,
          unknownWords: story.unknownWords.map((word) =>
            word.id !== wordId ? word : { ...word, status: newStatus }
          ),
        };
      });
    },
    [chosenStory]
  );

  const handleWordStatusChange = useCallback(
    async (wordId: number, newStatus: "learned" | "learning") => {
      let jobStarter: JobStarter;
      const optimisticUpdate = (data: Story[] | undefined) =>
        updateCurrentDataWithNewWordStatus(data, wordId, newStatus);
      const onSuccess = () => {
        toast(`Word marked as ${newStatus}`);
      };
      const onError = ({ error }: { error?: Error }) => {
        if (error) {
          toast.error(error.message);
        }
      };

      const jobStatusChecker = (jobId: string) => unknownWordApi.checkJobStatus(jobId);
      if (newStatus === "learned") {
        jobStarter = () => unknownWordApi.markAsLearned(wordId);
      } else {
        jobStarter = () => unknownWordApi.markAsLearning(wordId);
      }
      await handleJob({
        jobStarter,
        jobStatusChecker,
        optimisticUpdate,
        mutate,
        onSuccess,
        onError,
      });
    },
    [mutate, unknownWordApi, updateCurrentDataWithNewWordStatus]
  );

  return { setWordStatus: handleWordStatusChange };
}
