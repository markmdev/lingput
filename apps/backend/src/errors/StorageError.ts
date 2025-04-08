import { CustomError } from "./CustomError";

export class StorageError extends CustomError {
  constructor(message: string, details?: unknown) {
    super(message, 502, details);
  }
}
