import { ServerApi } from "@/lib/api.server";

export async function getCurrentUser() {
  const serverApi = new ServerApi();
  return serverApi.api("/api/auth/me", {
    method: "GET",
  });
}
