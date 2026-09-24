import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * Sign a JWT token with the given payload.
 */
export function signToken(payload: { userId: string; phone: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token.
 * Throws an error if the token is invalid or expired.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
