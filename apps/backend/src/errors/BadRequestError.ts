import { CustomError } from "./CustomError";

export class BadRequestError extends CustomError {
  errors?: any;

  constructor(message: string, errors?: any) {
    super(message);
    this.errors = errors;
  }
}
