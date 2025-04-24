import { ApiResponse, Pagination } from "@/types/response.types";
import { ZodIssue } from "zod";

export function formatResponse<T>(data: T, pagination?: Pagination, statusCode = 200): ApiResponse<T> {
  return {
    success: statusCode >= 200 && statusCode < 300,
    data,
    pagination,
  };
}

export function formatErrorResponse(message: string, code?: number, details?: ZodIssue[]): ApiResponse<undefined> {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
}
