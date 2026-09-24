import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../types';

/**
 * Request body validation middleware using Zod schemas.
 * Returns a middleware that parses req.body against the provided schema.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new AppError(400, 'VALIDATION_ERROR', 'Invalid request data', details));
      } else {
        next(error);
      }
    }
  };
}
