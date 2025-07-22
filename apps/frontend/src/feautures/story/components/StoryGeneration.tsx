import { ClientApi } from "@/lib/ClientApi";
import { useState } from "react";
import { StoryApi } from "../api";
import { Story } from "../types";
import Button from "@/components/Button";
import SuggestedTopic from "./SuggestedTopic";
import { toast } from "react-toastify";
import { errorNormalizer } from "@/lib/errorNormalizer";
import Skeleton from "react-loading-skeleton";
import { handleJob } from "@/lib/jobHandler";
import { KeyedMutator } from "swr";

export default function StoryGeneration({
  mutate,
  setToNewStory,
  isPageLoading,
}: {
  mutate: KeyedMutator<Story[]>;
  setToNewStory: (story: Story) => void;
  isPageLoading: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState("");

  const clientApi = new ClientApi();
  const storyApi = new StoryApi(clientApi);

  const handleGenerateStory = async () => {
    setIsLoading(true);
    const jobStarter = () => storyApi.generateNewStory(topic);
    const jobStatusChecker = (jobId: string) => storyApi.checkJobStatus(jobId);
    const onSuccess = (story: Story) => setToNewStory(story);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onError = ({ error, data }: { error?: Error; data?: any }) => {
      // Display form errors
      const normalizedErrors = errorNormalizer(error);
      setFormErrors(normalizedErrors.fields);
      // Display general errors
      if (normalizedErrors.general.length > 0) {
        toast.error(`${normalizedErrors.general.join(". ")}`);
      }
      // Display an error from jobHandler
      if (data?.failedReason) {
        toast.error(`${data?.failedReason || ""}`);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onProgress = (newProgress: any) => {
      setProgress(JSON.stringify(newProgress));
    };

    await handleJob({ jobStarter, jobStatusChecker, mutate, onSuccess, onError, onProgress });
    setIsLoading(false);
  };

  const handleSelectTopic = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setTopic(e.currentTarget.textContent || "");
  };
  return (
    <div>
      <div className="w-full h-full flex flex-col items-center">
        {isLoading ? (
          <p>{progress}</p>
        ) : (
          <form className="flex flex-col gap-4 w-full lg:w-2/3 xl:w-1/2 text-center">
            <label htmlFor="topic" className="font-bold text-6xl">
              Topic
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                name="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={`border rounded-lg py-4 px-4 outline-none text-2xl ${
                  formErrors.subject && "border-red-500"
                }`}
                placeholder="Input your desired topic..."
              />
              {formErrors.subject && (
                <div className="text-red-500 text-sm mr-auto">{formErrors.subject}</div>
              )}
              <div className="grid gap-2 grid-cols-3 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5">
                <SuggestedTopic topic="Traveling" onSelectTopic={handleSelectTopic} />
                <SuggestedTopic topic="Food" onSelectTopic={handleSelectTopic} />
                <SuggestedTopic topic="Sports" onSelectTopic={handleSelectTopic} />
                <SuggestedTopic topic="Technology" onSelectTopic={handleSelectTopic} />
                <SuggestedTopic topic="Sci-Fi" onSelectTopic={handleSelectTopic} />
                <SuggestedTopic topic="Fantasy" onSelectTopic={handleSelectTopic} />
                <SuggestedTopic topic="Mystery" onSelectTopic={handleSelectTopic} />
              </div>
            </div>
            {isPageLoading ? (
              <Skeleton height={50} />
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                onClick={handleGenerateStory}
                styles="text-xl"
              >
                Generate
              </Button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
