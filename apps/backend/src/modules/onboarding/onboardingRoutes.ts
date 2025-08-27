import { NextFunction, Request, Response, Router } from "express";
import { OnboardingController } from "./onboardingController";
import { asyncHandler } from "@/middlewares/asyncHandler";

export function buildOnboardingRouter(
  controller: OnboardingController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void,
) {
  const router = Router();

  router.post(
    "/complete",
    authMiddleware,
    asyncHandler(controller.completeOnboarding),
  );
  router.get(
    "/check",
    authMiddleware,
    asyncHandler(controller.checkOnboarding),
  );

  return router;
}
