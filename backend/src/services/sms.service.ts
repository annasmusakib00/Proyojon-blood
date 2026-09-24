import axios from 'axios';
import { otpSMS } from '../utils/smsTemplates';

const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL || '';
const SMS_API_KEY = process.env.SMS_API_KEY || '';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'PROYOJON';

/**
 * Send an SMS message to a phone number.
 * In development mode, logs the SMS to console instead of actually sending.
 *
 * @returns true on success, false on failure.
 */
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('\n──────────────── SMS ────────────────');
    console.log(`To:      ${phone}`);
    console.log(`Message: ${message}`);
    console.log('────────────────────────────────────\n');
    return true;
  }

  try {
    const response = await axios.post(SMS_GATEWAY_URL, {
      api_key: SMS_API_KEY,
      sender_id: SMS_SENDER_ID,
      phone,
      message,
    });

    if (response.status === 200) {
      console.log(`[SMS] Sent to ${phone}`);
      return true;
    }

    console.error(`[SMS] Failed to send to ${phone}:`, response.data);
    return false;
  } catch (error) {
    console.error(`[SMS] Error sending to ${phone}:`, error);
    return false;
  }
}

/**
 * Send an OTP code via SMS.
 */
export async function sendOtpSMS(phone: string, otp: string): Promise<boolean> {
  return sendSMS(phone, otpSMS(otp));
}
