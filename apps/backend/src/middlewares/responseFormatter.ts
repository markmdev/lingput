import { ErrorResponse, Pagination, SuccessResponse } from "@/types/response.types";
import { ZodIssue } from "zod";

export function formatResponse<T>(data: T, pagination?: Pagination): SuccessResponse<T> {
  return {
    success: true,
    data,
    pagination,
  };
}

export function formatErrorResponse({
  message,
  statusCode,
  userDetails,
}: {
  message: string;
  statusCode: number;
  userDetails?: ZodIssue[];
}): ErrorResponse {
  return {
    success: false,
    error: {
      message,
      code: statusCode,
      details: userDetails,
    },
  };
}
