import { ServerApi } from "@/lib/ServerApi";

interface User {
  user: {
    userId: number;
  };
}

export async function getCurrentUser() {
  const serverApi = new ServerApi();
  try {
    return await serverApi.api<User>({
      path: "/api/auth/me",
      options: {
        method: "GET",
      },
      noRetry: true,
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}
