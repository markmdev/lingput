import { CustomError } from "./CustomError";

export class EnvError extends CustomError {
  constructor(message: string) {
    super(message, 500, null);
  }
}
