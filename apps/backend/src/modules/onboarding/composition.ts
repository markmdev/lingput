import { PrismaClient } from "@prisma/client";
import { OnboardingController } from "./onboardingController";
import { buildOnboardingRouter } from "./onboardingRoutes";
import { NextFunction, Request, Response } from "express";

export function createOnboardingModule(deps: {
  prisma: PrismaClient;
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
}) {
  const controller = new OnboardingController(deps.prisma);
  return { router: buildOnboardingRouter(controller, deps.authMiddleware) };
}
