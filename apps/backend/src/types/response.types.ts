export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination?: Pagination;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
