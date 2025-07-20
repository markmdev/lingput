import { KeyedMutator } from "swr";
import { JobResponse, JobStatusResponse } from "./backendApi";

export type JobStarter = () => Promise<JobResponse>;

export type JobStatusChecker = (jobId: string) => Promise<JobStatusResponse>;

export type OptimisticUpdate<T> = (data: T | undefined) => T | undefined;

export async function handleJob<T>({
  jobStarter,
  jobStatusChecker,
  optimisticUpdate,
  mutate,
  onSuccess,
  onError,
}: {
  jobStarter: JobStarter;
  jobStatusChecker: JobStatusChecker;
  optimisticUpdate: OptimisticUpdate<T>;
  mutate: KeyedMutator<T>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  let previousData: T | undefined;
  try {
    mutate((currentData) => {
      previousData = currentData;
      return optimisticUpdate(currentData);
    }, false);
    const job = await jobStarter();
    let res: JobStatusResponse | undefined;
    while (!res || !["completed", "failed", "delayed"].includes(res.status)) {
      res = await jobStatusChecker(job.jobId);
      console.log(res);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (res.status === "failed") {
      mutate(previousData, false);
      if (onError) {
        onError(new Error("Job failed"));
      }
    } else if (res.status === "delayed") {
      mutate(previousData, false);
      if (onError) {
        onError(new Error("Job was delayed"));
      }
    } else if (res.status === "completed") {
      mutate();
      if (onSuccess) onSuccess();
    }
  } catch (error) {
    mutate(previousData, false);
    if (onError && error instanceof Error) {
      onError(error);
    }
  }
}
