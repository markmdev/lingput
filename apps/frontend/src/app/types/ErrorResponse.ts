export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: number;
    details?: unknown;
  };
}
