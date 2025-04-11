import { AuthError } from "@/errors/auth/AuthError";
import { AuthService } from "@/modules/auth/authService";
import { Request, Response, NextFunction } from "express";

const authService = new AuthService();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.cookies;

  try {
    const user = await authService.verifyToken(token);
    console.log(user);
    req.user = user;
    next();
  } catch (error) {
    next(new AuthError("User isn't authorized"));
  }
};
