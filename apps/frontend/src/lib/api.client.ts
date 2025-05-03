import { ApiError } from "../types/ApiError";
import { ErrorResponse } from "../types/ErrorResponse";

export class ClientApi {
  constructor() {}

  async api<T>({ path, options }: { path: string; options: RequestInit }): Promise<T> {
    const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendApiUrl) {
      throw new Error("NEXT_PUBLIC_BACKEND_URL env variable is not set.");
    }

    let res = await this.sendRequest(backendApiUrl, path, options);

    if (res.status === 401 && path !== "/api/auth/refresh") {
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
      throw new ApiError(errorPayload.error.message, errorPayload.error.code);
    }

    const json = await res.json();
    return json.data;
  }

  refreshToken() {
    return this.api({
      path: "/api/auth/refresh",
      options: {
        method: "POST",
      },
    });
  }

  async sendRequest(apiUrl: string, path: string, options: RequestInit) {
    let res: Response;
    try {
      res = await fetch(`${apiUrl}${path}`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        ...options,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        throw new Error(`Unexpected error while fetching ${path}: ${error.message}`);
      }
      throw new Error("Unknown error");
    }

    return res;
  }
}
