import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { Role } from '@prisma/client';

export interface AccessPayload {
  id: string;
  role: Role;
  departmentId?: string;
  tokenVersion: number;
}

export const signAccess = (p: AccessPayload) =>
  jwt.sign(p, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
  } as SignOptions);

export const verifyAccess = (t: string) =>
  jwt.verify(t, env.JWT_ACCESS_SECRET) as AccessPayload;

export const signRefresh = (userId: string, jti: string) =>
  jwt.sign({ id: userId, jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d`,
  } as SignOptions);

export const verifyRefresh = (t: string) =>
  jwt.verify(t, env.JWT_REFRESH_SECRET) as { id: string; jti: string };