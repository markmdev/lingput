import { prisma } from "@/services/prisma";
import { SessionRepository } from "./sessionRepository";
import { SessionService } from "./sessionService";

const sessionRepository = new SessionRepository(prisma);
export const sessionService = new SessionService(sessionRepository);