import { prisma } from "@/services/prisma";
import { userRepository } from "../user/composition";
import { AuthRepository } from "./authRepository";
import { AuthController } from "./authController";
import { AuthService } from "./authService";

// Repositories
const authRepository = new AuthRepository(prisma);

// Business logic
export const authService = new AuthService(authRepository);

// Controller
export const authController = new AuthController(authService, userRepository);
