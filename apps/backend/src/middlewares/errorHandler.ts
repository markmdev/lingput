import { Request, Response, NextFunction } from "express";
import { CustomError } from "@/errors/CustomError";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { BadRequestError } from "@/errors/BadRequestError";
import { formatErrorResponse } from "./responseFormatter";
import { logger } from "@/utils/logger";

function serializeError(error?: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
    };
  }
  return error;
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const logBase = {
    type: err.constructor.name,
    method: req.method,
    url: req.originalUrl,
    user: req.user || null,
    name: err.name,
    message: err.message,
    details: err.details,
    originalError: serializeError(err.originalError),
  };

  if (err instanceof BadRequestError) {
    logger.warn({
      ...logBase,
      validationErrors: err.errors,
    });
    res.status(400).json(formatErrorResponse(err.message, "BAD_REQUEST", err.errors));
    return;
  }

  if (err instanceof CustomError) {
    logger.error({
      ...logBase,
    });
    res.status(err.statusCode).json(formatErrorResponse(err.message));
    return;
  }

  if (
    err instanceof PrismaClientKnownRequestError ||
    err instanceof PrismaClientUnknownRequestError ||
    err instanceof PrismaClientRustPanicError ||
    err instanceof PrismaClientInitializationError ||
    err instanceof PrismaClientValidationError
  ) {
    logger.error({
      ...logBase,
      prismaCode: "code" in err ? err.code : null,
    });
    res.status(502).json(formatErrorResponse("Database error"));
    return;
  }

  logger.error({
    ...logBase,
    message: err.message || "Unknown server error",
    stack: err.stack,
  });
  res.status(500).json(formatErrorResponse("Unknown server response"));
};
