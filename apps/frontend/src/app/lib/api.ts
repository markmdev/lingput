export async function api(path: string, options: RequestInit) {
  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendApiUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL env variable is not set.");
  }

  const res = await fetch(`${backendApiUrl}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...options,
  });

  const json = await res.json();
  return json;
}

export async function login({ email, password }: { email: string; password: string }) {
  return api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
