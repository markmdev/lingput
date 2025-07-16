import { SessionRepository } from "./sessionRepository";
import { SessionService } from "./sessionService";
import { AppRedisClient } from "@/services/redis/redisClient";

export function createSessionModule(deps: { redis: AppRedisClient }) {
  const repository = new SessionRepository(deps.redis);
  const service = new SessionService(repository);

  return { service };
}
