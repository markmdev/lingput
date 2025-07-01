import { ClientApi } from "./ClientApi";

export interface JobResponse {
  queueName: string;
  jobId: string;
}

export interface JobStatusResponse {
  status: "completed" | "failed" | "waiting" | "active" | "delayed" | "paused";
  value?: unknown;
}

export class BackendApi {
  constructor(private clientApi: ClientApi) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  protected jobStatus(queueName: string, jobId: string): Promise<JobStatusResponse> {
    return this.clientApi.api<JobStatusResponse>({
      path: `/api/jobs/status/${queueName}/${jobId}`,
      options: {
        method: "GET",
      },
    });
  }
}
