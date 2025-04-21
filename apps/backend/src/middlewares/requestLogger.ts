import { logger } from "@/utils/logger";
import { NextFunction, Request, Response } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      message: "Request finished",
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      userId: req.user?.userId ?? null,
    });
  });

  next();
}
