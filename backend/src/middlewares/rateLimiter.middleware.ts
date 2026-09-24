import rateLimit from 'express-rate-limit';

/**
 * General rate limiter: 100 requests per minute per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
    },
  },
});

/**
 * OTP rate limiter: 5 requests per minute per IP.
 * Stricter to prevent brute-force OTP attempts.
 */
export const otpLimiter = rateLimit({
  windowMs: 60000,
  max: parseInt(process.env.OTP_RATE_LIMIT_MAX || '5'),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many OTP requests. Please wait before trying again.',
    },
  },
});
