import { authService } from "@/modules/auth/composition";
import { createAuthMiddleware } from "./authMiddleware";

export const authMiddleware = createAuthMiddleware(authService);
