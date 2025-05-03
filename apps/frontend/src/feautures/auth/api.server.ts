import { ServerApi } from "@/lib/api.server";

export async function getCurrentUser() {
  const serverApi = new ServerApi();
  try {
    return await serverApi.api("/api/auth/me", {
      method: "GET",
    });
  } catch {
    return null;
  }
}
