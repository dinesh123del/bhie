import { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler = <
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, unknown>,
>(
  handler: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<unknown>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
