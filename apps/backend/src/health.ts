import { Request, Response } from "express";
import { prisma } from "./services/prisma";
import { redisClient } from "./services/redis/redisClient";
import { logger } from "./utils/logger";

export const liveness = (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
};

export const readiness = async (_req: Request, res: Response) => {
  const withTimeout = <T>(p: Promise<T>, ms = 3000) =>
    Promise.race([
      p,
      new Promise<never>((_, r) =>
        setTimeout(() => r(new Error("timeout")), ms),
      ),
    ]);

  let dbOk = false,
    redisOk = false;

  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`);
    dbOk = true;
  } catch (error) {
    logger.error(error);
  }
  try {
    await withTimeout(redisClient.ping());
    redisOk = true;
  } catch (error) {
    logger.error(error);
  }

  const ok = dbOk && redisOk;
  res
    .status(ok ? 200 : 503)
    .json({ status: ok ? "ok" : "unhealthy", dbOk, redisOk });
};
