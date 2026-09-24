import api from './api';

/**
 * Toggle the donor's availability status.
 */
export async function toggleAvailability(isAvailable: boolean) {
  const response = await api.patch('/donor/availability', {
    is_available: isAvailable,
  });
  return response.data;
}

/**
 * Update the donor's current location.
 */
export async function updateLocation(latitude: number, longitude: number) {
  const response = await api.patch('/donor/location', {
    latitude,
    longitude,
  });
  return response.data;
}

/**
 * Update the donor's FCM push notification token.
 */
export async function updateFcmToken(token: string) {
  const response = await api.patch('/donor/fcm-token', {
    fcm_token: token,
  });
  return response.data;
}
