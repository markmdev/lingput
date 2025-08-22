import { Request, Response } from "express";
import { prisma } from "./services/prisma";
import { redisClient } from "./services/redis/redisClient";

export const liveness = (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
};

export const readiness = async (_req: Request, res: Response) => {
  const withTimeout = <T>(p: Promise<T>, ms = 3000) =>
    Promise.race([p, new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);

  let dbOk = false,
    redisOk = false;

  try {
    await withTimeout(prisma.$queryRaw`SELECT 1` as any);
    dbOk = true;
  } catch {}
  try {
    await withTimeout(redisClient.ping());
    redisOk = true;
  } catch {}

  const ok = dbOk && redisOk;
  res.status(ok ? 200 : 503).json({ status: ok ? "ok" : "unhealthy", dbOk, redisOk });
};
