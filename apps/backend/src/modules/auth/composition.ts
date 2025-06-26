import { userRepository } from "../user/composition";
import { AuthRepository } from "./authRepository";
import { AuthController } from "./authController";
import { AuthService } from "./authService";
import redisClient from "@/services/redis";

// Repositories
const authRepository = new AuthRepository(redisClient);

// Business logic
export const authService = new AuthService(authRepository);

// Controller
export const authController = new AuthController(authService, userRepository);
