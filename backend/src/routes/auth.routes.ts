import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { otpLimiter } from '../middlewares/rateLimiter.middleware';
import { registerSchema, verifyOtpSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.schema';

const router = Router();

router.post('/register', otpLimiter, validate(registerSchema), authController.register);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/login', otpLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', otpLimiter, validate(resetPasswordSchema), authController.resetPassword);

export default router;
