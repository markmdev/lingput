import { Router } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { createAuthController } from "./authControllerFactory";

export const authRouter = Router();

const authController = createAuthController();

authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.post("/refresh", asyncHandler(authController.refresh));
