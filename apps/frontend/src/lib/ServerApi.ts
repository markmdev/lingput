import { ApiError } from "@/types/ApiError";
import { EnvError } from "@/types/EnvError";
import { ErrorResponse } from "@/types/ErrorResponse";
import { cookies } from "next/headers";

export class ServerApi {
  AUTH_REFRESH_ENDPOINT = "/api/auth/refresh";
  constructor() {}

  private async getCookieHeaders(): Promise<string> {
    const cookieStore = await cookies();
    const cookieHeaders = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
    return cookieHeaders;
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

    const cookieHeaders = await this.getCookieHeaders();
    let res = await this.sendRequest(backendApiUrl, path, cookieHeaders, options);

    if (res.status === 401 && path !== this.AUTH_REFRESH_ENDPOINT && !noRetry) {
      await this.refreshToken();
      const newCookieHeaders = await this.getCookieHeaders();
      res = await this.sendRequest(backendApiUrl, path, newCookieHeaders, options);
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
      path: this.AUTH_REFRESH_ENDPOINT,
      options: {
        method: "POST",
      },
    });
  }

  async sendRequest(apiUrl: string, path: string, cookieHeaders: string, options: RequestInit) {
    let res: Response;
    try {
      res = await fetch(`${apiUrl}${path}`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeaders && { Cookie: cookieHeaders }),
        },
        ...options,
      });
    } catch (error) {
      throw new ApiError("Unexpected server error", 500);
    }

    return res;
  }
}
