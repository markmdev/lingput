import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useAuthRedirect(error?: any) {
  const router = useRouter();
  useEffect(() => {
    if (error?.statusCode === 401) {
      router.replace("/login");
    }
  }, [error, router]);
}
