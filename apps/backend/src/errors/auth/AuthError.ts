import { CustomError } from "../CustomError";

export class AuthError extends CustomError {
  constructor(message: string, details?: unknown, originalError?: unknown) {
    super(message, 401, details, originalError);
  }
}
