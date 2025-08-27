import { PrismaError } from "@/errors/PrismaError";
import { formatResponse } from "@/middlewares/responseFormatter";
import { AuthedRequest } from "@/types/types";
import { PrismaClient } from "@prisma/client";
import { Response } from "express";

export class OnboardingController {
  constructor(private prisma: PrismaClient) {}

  completeOnboarding = async (req: AuthedRequest, res: Response) => {
    const { userId } = req.user;
    try {
      await this.prisma.onboarding.upsert({
        where: {
          userId,
        },
        update: {
          status: "completed",
        },
        create: {
          user: {
            connect: { id: userId },
          },
          status: "completed",
        },
      });
    } catch (error) {
      throw new PrismaError("Failed on complete onboarding", error, { userId });
    }
    res.status(200).json(formatResponse({ success: true }));
  };

  checkOnboarding = async (req: AuthedRequest, res: Response) => {
    const { userId } = req.user;
    try {
      const result = await this.prisma.onboarding.findFirst({
        where: { userId },
      });
      if (result) {
        res.status(200).json(formatResponse({ status: "completed" }));
      } else {
        res.status(200).json(formatResponse({ status: "not_started" }));
      }
    } catch (error) {
      throw new PrismaError("Failed on check onboarding status", error, {
        userId,
      });
    }
  };
}
