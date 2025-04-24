import { ErrorDetails } from "./ErrorDetails";

export class CustomError extends Error {
  statusCode: number;
  details?: unknown;
  originalError: unknown | null;
  constructor(message: string, statusCode = 500, originalError: unknown | null = null, details?: ErrorDetails) {
    super(message);
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
