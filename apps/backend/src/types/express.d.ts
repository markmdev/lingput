/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
      user?: { userId: number };
    }
  }
}

export {};
