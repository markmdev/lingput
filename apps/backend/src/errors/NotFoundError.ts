import { CustomError } from "./CustomError";
import { ErrorDetails } from "./ErrorDetails";
export class NotFoundError extends CustomError {
  constructor(resource = "Resource", originalError: unknown | null = null, details?: ErrorDetails) {
    super(`${resource} not found`, 404, originalError, details);
  }
}
