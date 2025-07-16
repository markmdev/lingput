import { RedisStoryCache } from "@/cache/redisStoryCache";
import { UnknownWordController } from "./unknownWordController";
import { UnknownWordRepository } from "./unknownWordRepository";
import { UnknownWordService } from "./unknownWordService";
import { AppRedisClient } from "@/services/redis/redisClient";
import { PrismaClient } from "@prisma/client";
import { buildUnknownWordRouter } from "./unknownWordRoutes";
import { NextFunction, Request, Response } from "express";

export function createUnknownWordModule(deps: {
  prisma: PrismaClient;
  redis: AppRedisClient;
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
}) {
  const repository = new UnknownWordRepository(deps.prisma);
  const cache = new RedisStoryCache(deps.redis);
  const service = new UnknownWordService(repository, cache);
  const controller = new UnknownWordController(service);

  return { service, controller, router: buildUnknownWordRouter(controller, deps.authMiddleware) };
}
