import { ZodIssue } from "zod";

export interface IHandleableError {
  statusCode: number;
  formatResponse(): { message: string; statusCode: number; userDetails?: ZodIssue[] };
  log(): Record<string, any>;
}

export function serializeError(error?: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      type: error.constructor.name,
      name: error.name,
      stack: error.stack,
    };
  }
  return error;
}
