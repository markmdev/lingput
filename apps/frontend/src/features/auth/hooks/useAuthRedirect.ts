import { ApiError } from "@/types/ApiError";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useAuthRedirect(error?: ApiError) {
  const router = useRouter();
  useEffect(() => {
    if (error?.statusCode === 401) {
      router.replace("/login");
    }
  }, [error, router]);
}
