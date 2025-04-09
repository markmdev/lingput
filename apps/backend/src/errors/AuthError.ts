import { CustomError } from "./CustomError";

export class AuthError extends CustomError {
  constructor(message: string) {
    super(message);
  }
}
