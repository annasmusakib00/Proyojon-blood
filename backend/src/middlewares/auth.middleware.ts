import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../types';

/**
 * JWT authentication middleware.
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded payload to req.user.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Token not provided');
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token'));
    }
  }
}
