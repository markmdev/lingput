import { Router } from "express";
import { AuthController } from "./authController";
import { asyncHandler } from "@/middlewares/asyncHandler";

export const authRouter = Router();

const authController = new AuthController();

authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));
authRouter.post("/logout", asyncHandler(authController.logout));
