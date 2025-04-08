import { CustomError } from "./CustomError";

export class PrismaError extends CustomError {
  constructor(message: string, details?: unknown, originalError?: unknown) {
    super(message, 502, details, originalError);
  }
}
