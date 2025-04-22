import { prisma } from "@/services/prisma";
import { AuthRepository } from "./authRepository";
import { AuthService } from "./authService";

const authRepository = new AuthRepository(prisma);
export const authService = new AuthService(authRepository);
