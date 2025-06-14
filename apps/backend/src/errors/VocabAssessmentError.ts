import { CustomError } from "./CustomError";
import { ErrorDetails } from "./ErrorDetails";

export class VocabAssessmentError extends CustomError {
  constructor(message: string, originalError: unknown, details?: ErrorDetails) {
    super(message, 500, originalError, details);
  }
}
