import { AppError } from './AppError';

export const BadRequest = (m: string, d?: unknown) => new AppError(400, 'BAD_REQUEST', m, d);
export const Unauthorized = (m = 'Unauthorized') => new AppError(401, 'UNAUTHORIZED', m);
export const Forbidden = (m = 'Forbidden') => new AppError(403, 'FORBIDDEN', m);
export const NotFound = (m = 'Not found') => new AppError(404, 'NOT_FOUND', m);
export const Conflict = (m: string) => new AppError(409, 'CONFLICT', m);