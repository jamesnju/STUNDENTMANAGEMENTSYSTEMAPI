import { NextFunction, Request, Response } from 'express';

export const asyncHandler =
  <T extends Request = Request>(
    fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
  ) =>
  (req: T, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);