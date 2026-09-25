import { z } from 'zod';

export const availabilitySchema = z.object({
  is_available: z.boolean(),
});

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const fcmTokenSchema = z.object({
  fcm_token: z.string().min(1, 'FCM token is required'),
});

export const profilePhotoSchema = z.object({
  url: z.string().url('Must be a valid URL'),
});
