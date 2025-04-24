import { CustomError } from "./CustomError";
import { ErrorDetails } from "./ErrorDetails";
export class OpenAIError extends CustomError {
  constructor(message: string, originalError: unknown, details?: ErrorDetails) {
    super(message, 502, originalError, details);
  }
}
