import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns standardized error responses.
 */
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle known AppError instances
  if (err instanceof AppError || (err as any).statusCode) {
    const statusCode = (err as any).statusCode || 400;
    res.status(statusCode).json({
      success: false,
      error: {
        code: (err as any).code || 'ERROR',
        message: err.message,
        ...((err as any).details && { details: (err as any).details }),
      },
    });
    return;
  }

  // Log full error stack in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', err);
  }

  // Generic internal server error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'An unexpected error occurred. Please try again later.',
    },
  });
}
