import { BackendApi } from "@/lib/backendApi";

export class OnboardingApi extends BackendApi {
  complete(): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>("/api/onboarding/complete");
  }

  check(): Promise<{ status: "completed" | "not_started" }> {
    return this.fetch<{ status: "completed" | "not_started" }>("/api/onboarding/check");
  }
}
