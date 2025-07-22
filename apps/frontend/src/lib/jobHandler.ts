import { KeyedMutator } from "swr";
import { JobResponse, JobStatusResponse } from "./backendApi";

export type JobStarter = () => Promise<JobResponse>;

export type JobStatusChecker = (jobId: string) => Promise<JobStatusResponse>;

export type OptimisticUpdate<T> = (data: T | undefined) => T | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type onProgress = (progress: any) => void;

export async function handleJob<T>({
  jobStarter,
  jobStatusChecker,
  mutate,
  optimisticUpdate,
  onSuccess,
  onError,
  onProgress,
}: {
  jobStarter: JobStarter;
  jobStatusChecker: JobStatusChecker;
  mutate: KeyedMutator<T>;
  optimisticUpdate?: OptimisticUpdate<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess?: (result: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: ({ error, data }: { error?: Error; data?: any }) => void;
  onProgress?: onProgress;
}) {
  let previousData: T | undefined;
  try {
    if (optimisticUpdate) {
      mutate((currentData) => {
        previousData = currentData;
        return optimisticUpdate(currentData);
      }, false);
    }
    const job = await jobStarter();
    let res: JobStatusResponse | undefined;
    while (!res || !["completed", "failed", "delayed"].includes(res.status)) {
      res = await jobStatusChecker(job.jobId);
      console.log(res);

      if (res.status === "active" && onProgress) {
        onProgress(res.progress);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (res.status === "failed") {
      if (optimisticUpdate) {
        mutate(previousData, false);
      }
      if (onError) {
        onError({ data: { failedReason: res.failedReason } });
      }
    } else if (res.status === "delayed") {
      if (optimisticUpdate) {
        mutate(previousData, false);
      }
      if (onError) {
        onError({ error: new Error("Job was delayed") });
      }
    } else if (res.status === "completed") {
      mutate();
      if (onSuccess) onSuccess(res.value);
    }
  } catch (error) {
    if (optimisticUpdate) {
      mutate(previousData, false);
    }
    if (onError && error instanceof Error) {
      onError({ error });
    }
  }
}
