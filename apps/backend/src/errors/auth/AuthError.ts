import { ZodIssue } from "zod";
import { CustomError } from "../CustomError";
import { ErrorDetails } from "../ErrorDetails";

export class AuthError extends CustomError {
  constructor(message: string, originalError: unknown, details?: ErrorDetails) {
    super(message, 401, originalError, details);
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
}
