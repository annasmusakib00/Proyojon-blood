/**
 * SMS message templates for the Proyojon application.
 */

export function emergencyAlertSMS(params: {
  bags: number;
  bloodGroup: string;
  hospitalName: string;
  location: string;
  conveyanceAmount: number;
  appLink: string;
}): string {
  return `Urgent: ${params.bags} bags of ${params.bloodGroup} blood required at ${params.hospitalName}, ${params.location}. Conveyance Allowance: ${params.conveyanceAmount} BDT. Open the 'Proyojon' app to accept and get the patient's contact. Link: ${params.appLink}`;
}

export function proxyOnboardingSMS(appStoreLink: string): string {
  return `You just saved a life! Download 'Proyojon' to claim your Hero Badge and become a part of our donor community. ${appStoreLink}`;
}

export function autoUnlockSMS(): string {
  return `প্রয়োজন Alert: Your 4-month rest period is over. You can now donate blood again. Open the app to get started!`;
}

export function otpSMS(otp: string): string {
  return `Your Proyojon verification code is: ${otp}. This code expires in 5 minutes. Do not share it with anyone.`;
}
