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
import { AuthError } from "@/errors/auth/AuthError";

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
  if (!(err instanceof Error)) {
    logger.error({ message: "Unknown error", error: err });
    res.status(500).json(formatErrorResponse("Unknown server error", 500));
    return;
  }

  const logBase = {
    type: err.constructor.name,
    method: req.method,
    url: req.originalUrl,
    user: req.user || null,
    name: err.name,
    message: err.message,
  };

  if (err instanceof BadRequestError) {
    logger.warn({
      ...logBase,
      validationErrors: err.errors,
      details: err.details,
      originalError: serializeError(err.originalError),
    });
    res.status(400).json(formatErrorResponse(err.message, 400, err.errors));
    return;
  }

  if (err instanceof AuthError) {
    logger.warn({
      ...logBase,
      details: err.details,
    });
    res.status(401).json(formatErrorResponse(err.message, err.statusCode));
    return;
  }

  if (err instanceof CustomError) {
    logger.error({
      ...logBase,
      details: err.details,
      originalError: serializeError(err.originalError),
    });
    res.status(err.statusCode).json(formatErrorResponse(err.message, err.statusCode));
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
    res.status(502).json(formatErrorResponse("Database error", 502));
    return;
  }

  logger.error({
    ...logBase,
    message: err.message || "Unknown server response",
    stack: err.stack,
  });
  res.status(500).json(formatErrorResponse("Unknown server response", 500));
};
