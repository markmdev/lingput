import { ApiError } from "../types/ApiError";
import { Story, VocabularyItem } from "../types/ApiObjects";
import { ErrorResponse } from "../types/ErrorResponse";

async function sendRequest(apiUrl: string, path: string, options: RequestInit) {
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
      throw new Error(`Unexpected error while fetching ${path}: ${error.message}`);
    }
    throw new Error("Unknown error");
  }

  return res;
}

export async function api<T>({ path, options }: { path: string; options: RequestInit }): Promise<T | undefined> {
  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendApiUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL env variable is not set.");
  }

  let res = await sendRequest(backendApiUrl, path, options);

  if (res.status === 401) {
    await refreshToken();
    res = await sendRequest(backendApiUrl, path, options);
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

  if (res.status === 204) {
    return undefined;
  }

  const json = await res.json();
  return json.data;
}

export async function login({ email, password }: { email: string; password: string }) {
  return api({
    path: "/api/auth/login",
    options: {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  });
}

async function refreshToken() {
  return api({
    path: "/api/auth/refresh",
    options: {
      method: "POST",
    },
  });
}

export class StoryApi {
  constructor() {}

  getAllStories(): Promise<Story[] | undefined> {
    return api<Story[]>({
      path: "/api/story",
      options: {
        method: "GET",
      },
    });
  }

  getAllVocabulary(): Promise<VocabularyItem[] | undefined> {
    return api<VocabularyItem[]>({
      path: "/api/vocab/allwords",
      options: {
        method: "GET",
      },
    });
  }
}
