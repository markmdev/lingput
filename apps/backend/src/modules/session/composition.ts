import { SessionRepository } from "./sessionRepository";
import { SessionService } from "./sessionService";
import redisClient from "@/services/redis";

const sessionRepository = new SessionRepository(redisClient);
export const sessionService = new SessionService(sessionRepository);
