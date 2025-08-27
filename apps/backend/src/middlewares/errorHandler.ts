import { Request, Response } from "express";
import { formatErrorResponse } from "./responseFormatter";
import { logger } from "@/utils/logger";
import { IHandleableError } from "@/errors/common";

export const errorHandler = (err: unknown, req: Request, res: Response) => {
  const user = req.user;
  const logBase = {
    method: req.method,
    url: req.originalUrl,
    user: user || null,
  };

  // Check if err matches IHandleableError
  if (
    err instanceof Error &&
    "formatResponse" in err &&
    "log" in err &&
    "statusCode" in err
  ) {
    const handleableError = err as IHandleableError;
    const logObject = {
      ...logBase,
      ...handleableError.log(),
    };

    if (handleableError.statusCode < 500) {
      logger.warn(logObject);
    } else {
      logger.error(logObject);
    }
    res
      .status(handleableError.statusCode)
      .json(formatErrorResponse(handleableError.formatResponse()));
    return;
  }

  const unknownError =
    err instanceof Error ? err : new Error("Unknown server error");

  logger.error({
    ...logBase,
    message: unknownError.message,
    stack: unknownError.stack,
  });
  res
    .status(500)
    .json(
      formatErrorResponse({ message: unknownError.message, statusCode: 500 }),
    );
};
