import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: Role;
      departmentId?: string;
      tokenVersion: number;
    }
    interface Request {
      user?: UserPayload;
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export {};