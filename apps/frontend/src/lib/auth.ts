import { cookies } from "next/headers";

async function sendRequest(apiUrl: string, path: string, cookieHeaders: string, options: RequestInit) {
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

async function api(path: string, options: RequestInit) {
  const cookieStore = await cookies();
  const cookieHeaders = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendApiUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL env variable is not set.");
  }

  let res = await sendRequest(backendApiUrl, path, cookieHeaders, options);

  if (res.status === 401) {
    await refreshToken();
    res = await sendRequest(backendApiUrl, path, cookieHeaders, options);
  }

  const json = await res.json();
  return json;
}

async function refreshToken() {
  return api("/api/auth/refresh", {
    method: "POST",
  });
}

async function me() {
  return api("/api/auth/me", {
    method: "GET",
  });
}

export async function getCurrentUser() {
  const res = await me();
  if (!res.success) return null;

  return res;
}
