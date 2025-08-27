import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = <Req extends Request = Request>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (req: Req, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler => {
  return (req, res, next) => {
    fn(req as Req, res, next).catch(next);
  };
};
