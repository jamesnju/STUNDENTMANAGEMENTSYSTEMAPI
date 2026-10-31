import { NextFunction, Request, Response } from 'express';
import { Forbidden } from '../shared/errors/httpErrors';

// Ensures any departmentId on the request body/query matches the user's own.
// Admin bypasses. Teacher/student are forced to their own department.
export const scopeDepartment = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(Forbidden());
  if (req.user.role === 'ADMIN') return next();

  const requested = req.body?.departmentId ?? req.query?.departmentId;
  if (requested && requested !== req.user.departmentId) {
    return next(Forbidden('Cross-department access denied'));
  }
  // Force-set it so downstream services always use the trusted value
  if (req.body) req.body.departmentId = req.user.departmentId;
  next();
};