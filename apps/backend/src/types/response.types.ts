import { ZodIssue } from "zod";

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  pagination?: Pagination;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: number;
    // details for user
    details?: ZodIssue[];
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
