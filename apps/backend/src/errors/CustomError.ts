import { ZodIssue } from "zod";
import { IHandleableError, serializeError } from "./common";
import { ErrorDetails } from "./ErrorDetails";

export class CustomError extends Error implements IHandleableError {
  constructor(
    public message: string,
    public statusCode: number,
    public originalError: unknown,
    public details?: ErrorDetails
  ) {
    super(message);
  }

  formatResponse(): { message: string; statusCode: number; userDetails?: ZodIssue[] } {
    return {
      message: this.message,
      statusCode: this.statusCode,
    };
  }

  log() {
    return {
      details: this.details,
      originalError: serializeError(this.originalError),
    };
  }
}
