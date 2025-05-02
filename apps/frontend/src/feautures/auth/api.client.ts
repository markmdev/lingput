import { ClientApi } from "@/lib/api.client";

export async function login({ email, password }: { email: string; password: string }) {
  const clientApi = new ClientApi();
  return clientApi.api({
    path: "/api/auth/login",
    options: {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  });
}
