import { AuthRepository } from "./authRepository";
import { AuthController } from "./authController";
import { AuthService } from "./authService";
import { AppRedisClient } from "@/services/redis/redisClient";
import { UserRepository } from "../user/userRepository";
import { buildAuthRouter } from "./authRoutes";

export function createAuthModule(deps: { redis: AppRedisClient; userRepository: UserRepository }) {
  const repository = new AuthRepository(deps.redis);
  const service = new AuthService(repository);
  const controller = new AuthController(service, deps.userRepository);

  return { service, controller };
}
