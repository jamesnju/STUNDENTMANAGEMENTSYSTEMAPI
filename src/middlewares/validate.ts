import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { BadRequest } from '../shared/errors/httpErrors';

type Schemas = { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema };

export const validate =
  (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) (req as any).validatedQuery = schemas.query.parse(req.query);
      if (schemas.params) (req as any).validatedParams = schemas.params.parse(req.params);
      next();
    } catch (e) {
      next(e);
    }
  };