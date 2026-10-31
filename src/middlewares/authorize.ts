import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { Forbidden } from '../shared/errors/httpErrors';

export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(Forbidden());
    if (!roles.includes(req.user.role)) return next(Forbidden('Insufficient role'));
    next();
  };