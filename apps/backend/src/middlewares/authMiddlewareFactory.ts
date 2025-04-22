import { createAuthMiddleware } from "./authMiddleware";
import { authService } from "@/modules/auth/authServiceFactory";

export const authMiddleware = createAuthMiddleware(authService);
