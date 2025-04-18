import { AuthError } from "@/errors/auth/AuthError";
import { AuthRepository } from "@/modules/auth/authRepository";
import { AuthService } from "@/modules/auth/authService";
import { logger } from "@/utils/logger";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();
const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    next(new AuthError("User isn't authorized"));
    return;
  }

  try {
    const user = await authService.verifyAccessToken(accessToken);
    req.user = user;
    next();
  } catch (error) {
    next(new AuthError("User isn't authorized"));
  }
};
