import { ClientApi } from "./ClientApi";

export interface JobResponse {
  jobId: string;
}

export interface JobStatusResponse {
  status: "completed" | "failed" | "waiting" | "active" | "delayed" | "paused";
  value?: unknown;
  failedReason?: string;
  progress?: any;
}

export class BackendApi {
  constructor(private clientApi: ClientApi) {}

  protected post<T>(path: string, body?: any): Promise<T> {
    return this.clientApi.api<T>({
      path,
      options: {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
        headers: { "Content-Type": "application/json" },
      },
    });
  }

  protected fetch<T>(path: string): Promise<T> {
    return this.clientApi.api<T>({
      path,
      options: {
        method: "GET",
      },
    });
  }

  protected jobStatus(jobId: string): Promise<JobStatusResponse> {
    return this.clientApi.api<JobStatusResponse>({
      path: `/api/jobs/status/${jobId}`,
      options: {
        method: "GET",
      },
    });
  }
}
