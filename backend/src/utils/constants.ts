export const LOCK_DURATION_DAYS = parseInt(process.env.LOCK_DURATION_DAYS || '120');
export const SEARCH_RADIUS_KM = parseInt(process.env.SEARCH_RADIUS_KM || '5');
export const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5');
export const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5');
export const BLOOD_GROUPS = [
  'A_POS',
  'A_NEG',
  'B_POS',
  'B_NEG',
  'O_POS',
  'O_NEG',
  'AB_POS',
  'AB_NEG',
] as const;
