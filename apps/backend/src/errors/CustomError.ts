import { ZodIssue } from "zod";
import { IHandleableError, serializeError } from "./common";
import { ErrorDetails } from "./ErrorDetails";

export class CustomError extends Error implements IHandleableError {
  originalError: Error | unknown;
  constructor(
    public message: string,
    public statusCode: number,
    originalError: unknown,
    public details?: ErrorDetails,
  ) {
    super(message);
    this.originalError = serializeError(originalError);
  }

  formatResponse(): {
    message: string;
    statusCode: number;
    userDetails?: ZodIssue[];
  } {
    return {
      message: this.message,
      statusCode: this.statusCode,
    };
  }

  log() {
    return {
      name: this.constructor.name,
      message: this.message,
      details: this.details,
      originalError: this.originalError,
    };
  }
}
