import { Request, Response, NextFunction } from "express";
import { formatErrorResponse } from "./responseFormatter";
import { logger } from "@/utils/logger";
import { IHandleableError } from "@/errors/common";

function serializeError(error?: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      type: error.constructor.name,
      name: error.name,
      stack: error.stack,
    };
  }
  return error;
}

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  const logBase = {
    method: req.method,
    url: req.originalUrl,
    user: req.user || null,
  };

  // Check if err matches IHandleableError
  if (err instanceof Error && "formatResponse" in err && "log" in err && "statusCode" in err) {
    const handleableError = err as IHandleableError;
    const logObject = {
      message: err.message,
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

  const unknownError = err instanceof Error ? err : new Error("Unknown server error");

  logger.error({
    ...logBase,
    message: unknownError.message,
    stack: unknownError.stack,
  });
  res.status(500).json(formatErrorResponse({ message: unknownError.message, statusCode: 500 }));
};
