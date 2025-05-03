export class ApiError extends Error {
  constructor(public message: string, public statusCode: number, public details?: unknown) {
    super(message);
  }
}
