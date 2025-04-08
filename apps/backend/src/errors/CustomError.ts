export class CustomError extends Error {
  statusCode: number;
  details?: unknown;
  originalError?: unknown;
  constructor(message: string, statusCode = 500, details?: unknown, originalError?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.originalError = originalError;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
