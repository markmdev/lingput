import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = <Req extends Request = Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    fn(req as Req, res, next).catch(next);
  };
};
