import { NextFunction, Request, Response } from 'express';
import { verifyAccess } from '../shared/utils/jwt';
import { Unauthorized } from '../shared/errors/httpErrors';
import { prisma } from '../config/database';

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.accessToken;
    if (!token) throw Unauthorized('No token provided');

    const payload = verifyAccess(token);
    // Verify user still active + token not revoked (tokenVersion)
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, isActive: true, deletedAt: true, tokenVersion: true },
    });
    if (!user || !user.isActive || user.deletedAt) throw Unauthorized('Account inactive');
    if (user.tokenVersion !== payload.tokenVersion) throw Unauthorized('Token revoked');

    req.user = {
      id: user.id,
      role: user.role,
      departmentId: payload.departmentId,
      tokenVersion: user.tokenVersion,
    };
    next();
  } catch (e) {
    next(e instanceof Error && e.message ? Unauthorized(e.message) : Unauthorized());
  }
};