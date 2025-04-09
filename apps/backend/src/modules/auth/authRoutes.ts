import { Router } from "express";
import { AuthController } from "./authController";

export const authRouter = Router();

const authController = new AuthController();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
