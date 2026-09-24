import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, phone, blood_group, password } = req.body;
    const result = await authService.register(name, phone, blood_group, password);
    res.status(200).json({ success: true, data: result, message: 'OTP sent successfully' });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone, otp } = req.body;
    const result = await authService.verifyOtp(phone, otp);
    res.status(200).json({ success: true, data: result, message: 'Account verified successfully' });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone, password } = req.body;
    const result = await authService.login(phone, password);
    res.status(200).json({ success: true, data: result, message: 'Logged in successfully' });
  } catch (error) {
    next(error);
  }
}
