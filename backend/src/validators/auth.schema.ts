import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid Bangladeshi phone number'),
  blood_group: z.enum([
    'A_POS', 'A_NEG', 'B_POS', 'B_NEG',
    'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG',
  ]),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid Bangladeshi phone number'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});
