import { EnvError } from "@/types/EnvError";
import { ApiError } from "../types/ApiError";
import { ErrorResponse } from "../types/ErrorResponse";

export class ClientApi {
  AUTH_REFRESH_ENDPOINT: string;

  constructor() {
    this.AUTH_REFRESH_ENDPOINT = "/api/auth/refresh";
  }

  async api<T>({
    path,
    options,
    noRetry = false,
  }: {
    path: string;
    options: RequestInit;
    noRetry?: boolean;
  }): Promise<T> {
    const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendApiUrl) {
      throw new EnvError("NEXT_PUBLIC_BACKEND_URL env variable is not set.");
    }

    let res = await this.sendRequest(backendApiUrl, path, options);

    if (res.status === 401 && path !== this.AUTH_REFRESH_ENDPOINT && !noRetry) {
      await this.refreshToken();
      res = await this.sendRequest(backendApiUrl, path, options);
    }

    if (!res.ok) {
      let errorPayload: ErrorResponse;

      try {
        errorPayload = await res.json();
      } catch {
        throw new ApiError(res.statusText, res.status);
      }
      throw new ApiError(
        errorPayload.error.message,
        errorPayload.error.code,
        errorPayload.error.details
      );
    }

    const json = await res.json();
    return json.data;
  }

  refreshToken() {
    return this.api({
      path: this.AUTH_REFRESH_ENDPOINT,
      options: {
        method: "POST",
      },
    });
  }

  async sendRequest(apiUrl: string, path: string, options: RequestInit) {
    let res: Response | undefined;
    let retries = 3;

    while (retries > 0) {
      try {
        res = await fetch(`${path}`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          ...options,
        });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          if (error instanceof Error) {
            throw new Error(`Unexpected error while fetching ${path}: ${error.message}`);
          }
          throw new Error("Unknown error");
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!res) {
      throw new Error("Failed to get response after retries");
    }

    return res;
  }
}
