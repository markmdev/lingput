import { CustomError } from "../CustomError";

export class RegisterError extends CustomError {
  constructor(message: string, details?: unknown) {
    super(message, 400, details);
  }
}
