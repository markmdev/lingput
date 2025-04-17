import { ApiResponse, Pagination } from "@/types/response.types";

export function formatResponse<T>(data: T, pagination?: Pagination, statusCode = 200): ApiResponse<T> {
  return {
    success: statusCode >= 200 && statusCode < 300,
    data,
    pagination,
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
