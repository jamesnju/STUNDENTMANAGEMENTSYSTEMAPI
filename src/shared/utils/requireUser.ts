// src/shared/utils/requireUser.ts
import { Request } from 'express';
import { Unauthorized } from '../errors/httpErrors';

export function requireUser(req: Request): Express.UserPayload {
  if (!req.user) throw Unauthorized('Authentication required');
  return req.user;
}