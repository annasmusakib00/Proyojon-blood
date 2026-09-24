import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { otpLimiter } from '../middlewares/rateLimiter.middleware';
import { registerSchema, verifyOtpSchema, loginSchema } from '../validators/auth.schema';

const router = Router();

router.post('/register', otpLimiter, validate(registerSchema), authController.register);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/login', otpLimiter, validate(loginSchema), authController.login);

export default router;
