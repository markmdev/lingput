import { ApiError } from "@/types/ApiError";
import { ErrorResponse } from "@/types/ErrorResponse";
import { cookies } from "next/headers";

export class ServerApi {
  AUTH_REFRESH_ENDPOINT = "/api/auth/refresh";
  constructor() {}

  async api(path: string, options: RequestInit) {
    const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendApiUrl) {
      throw new Error("NEXT_PUBLIC_BACKEND_URL env variable is not set.");
    }
    const cookieStore = await cookies();
    const cookieHeaders = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    let res = await this.sendRequest(backendApiUrl, path, cookieHeaders, options);

    if (res.status === 401 && path !== this.AUTH_REFRESH_ENDPOINT) {
      await this.refreshToken();
      const newCookies = await cookies();
      const newCookieHeaders = newCookies
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");
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
    return json;
  }

  refreshToken() {
    return this.api(this.AUTH_REFRESH_ENDPOINT, {
      method: "POST",
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
      if (error instanceof Error) {
        throw new Error(`Unexpected error while fetching ${path}: ${error.message}`);
      }
      throw new Error("Unknown error");
    }

    return res;
  }
}
