import { z } from 'zod';

export const createRequestSchema = z.object({
  blood_group: z.enum([
    'A_POS', 'A_NEG', 'B_POS', 'B_NEG',
    'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG',
  ]),
  bags_needed: z.number().int().min(1).max(10),
  hospital_name: z.string().min(2).max(200),
  hospital_lat: z.number().min(-90).max(90),
  hospital_lng: z.number().min(-180).max(180),
  conveyance_amount: z.number().int().min(200).max(300),
  agreement_accepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the conveyance agreement' }),
  }),
});

export const acceptRequestSchema = z.object({
  type: z.literal('self'),
});

export const proxySchema = z.object({
  proxy_name: z.string().min(2).max(100),
  proxy_phone: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid Bangladeshi phone number'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'ARRIVED']),
});
