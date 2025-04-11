import { ApiResponse } from "@/types/response.types";

export function formatResponse<T>(data: T, statusCode = 200): ApiResponse<T> {
  return {
    success: statusCode >= 200 && statusCode < 300,
    data,
  };
}

export function formatErrorResponse(message: string, code?: string, details?: unknown): ApiResponse<undefined> {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
}
