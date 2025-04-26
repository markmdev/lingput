import { AuthError } from "@/errors/auth/AuthError";
import { AuthService } from "@/modules/auth/authService";
import { Request, Response, NextFunction } from "express";

export const createAuthMiddleware =
  (authService: AuthService) => async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      next(new AuthError("Unauthorized", null, { message: "No access token" }));
      return;
    }

    try {
      const user = await authService.verifyAccessToken(accessToken);
      req.user = user;
      next();
    } catch (error) {
      next(new AuthError("Unauthorized", error, { message: "Unable to verify access token" }));
    }
  };
