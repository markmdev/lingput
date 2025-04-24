import { CustomError } from "./CustomError";

export class StorageError extends CustomError {
  constructor(message: string, details?: unknown, originalError?: unknown) {
    super(message, 502, details, originalError);
  }
}
