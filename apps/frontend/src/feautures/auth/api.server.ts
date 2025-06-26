import { ServerApi } from "@/lib/ServerApi";
import { ApiError } from "@/types/ApiError";

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
      noRetry: false,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        return null;
      }
      throw error;
    }

    throw new ApiError("Unexpected error", 500);
  }
}
