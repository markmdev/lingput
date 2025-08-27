import { ZodIssue } from "zod";

export type SerializedError = {
  message: string;
  type: string;
  name: string;
  stack: string | undefined;
};

export interface IHandleableError {
  statusCode: number;
  formatResponse(): {
    message: string;
    statusCode: number;
    userDetails?: ZodIssue[];
  };
  log(): Record<string, unknown>;
}

export function serializeError(
  error?: Error | unknown,
): SerializedError | unknown {
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
