import { CustomError } from "./CustomError";

export class NotFoundError extends CustomError {
  constructor(resource = "Resource", details?: unknown) {
    super(`${resource} not found`, 404, details);
  }
}
