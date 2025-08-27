import { ZodIssue } from "zod";
import { CustomError } from "./CustomError";
import { ErrorDetails } from "./ErrorDetails";

export class BadRequestError extends CustomError {
  errors?: ZodIssue[];

  constructor(
    message: string,
    errors?: ZodIssue[],
    public details?: ErrorDetails,
  ) {
    super(message, 400, null);
    this.errors = errors;
  }

  formatResponse(): {
    message: string;
    statusCode: number;
    userDetails: ZodIssue[];
  } {
    return {
      message: this.message,
      statusCode: this.statusCode,
      userDetails: this.errors || [],
    };
  }

  log() {
    return {
      ...super.log(),
      validationErrors: this.errors,
    };
  }
}
