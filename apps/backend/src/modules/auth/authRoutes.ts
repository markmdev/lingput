import { NextFunction, Router, Request, Response } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { AuthController } from "./authController";

export function buildAuthRouter(
  controller: AuthController,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
) {
  const router = Router();
  router.post("/register", asyncHandler(controller.register));
  router.post("/login", asyncHandler(controller.login));
  router.post("/logout", asyncHandler(controller.logout));
  router.post("/refresh", asyncHandler(controller.refresh));
  router.get("/me", authMiddleware, asyncHandler(controller.me));

  return router;
}
