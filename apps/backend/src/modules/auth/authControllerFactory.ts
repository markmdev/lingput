import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../user/userRepository";
import { AuthController } from "./authController";
import { AuthRepository } from "./authRepository";
import { AuthService } from "./authService";

export function createAuthController(): AuthController {
  const prisma = new PrismaClient();
  const userRepository = new UserRepository();
  const authRepository = new AuthRepository(prisma);
  const authService = new AuthService(authRepository);
  const authController = new AuthController(authService, userRepository);

  return authController;
}
