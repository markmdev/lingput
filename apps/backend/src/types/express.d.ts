declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
      user?: { userId: number };
    }
  }
}

export {};
