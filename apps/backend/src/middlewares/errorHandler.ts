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
import { formatErrorResponse, formatResponse } from "./responseFormatter";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  if (err instanceof CustomError) {
    console.error({ message: err.message, details: err.details, originalError: err.originalError });
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
    res.status(502).json(formatErrorResponse("Database error"));
    return;
  }

  if (err instanceof BadRequestError) {
    res.status(400).json(formatErrorResponse("Bad request", "BAD_REQUEST", err.errors));
  }

  res.status(500).json(formatErrorResponse("Unknown server response"));
};
