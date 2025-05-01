import { cookies } from "next/headers";
import { ApiError } from "../types/ApiError";

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

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}${path}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeaders && { Cookie: cookieHeaders }),
      },
      ...options,
    });
  } catch (error) {
    console.log(error);
    throw new ApiError("Unexpected server error", 500);
  }

  const json = await res.json();
  return json;
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
