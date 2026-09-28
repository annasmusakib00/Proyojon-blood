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

/**
 * Update the donor's human-readable location text (e.g. "ঢাকা, মিরপুর").
 */
export async function updateLocationText(locationText: string) {
  const response = await api.patch('/donor/location-text', {
    location_text: locationText,
  });
  return response.data;
}

/**
 * Get all active donors across Bangladesh with optional filters.
 */
export async function getAllDonors(filters?: {
  blood_group?: string;
  location?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.blood_group) params.set('blood_group', filters.blood_group);
  if (filters?.location) params.set('location', filters.location);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));

  const response = await api.get(`/donor/all?${params.toString()}`);
  return response.data;
}

/**
 * Get a specific donor's public profile by ID.
 */
export async function getDonorPublicProfile(donorId: string) {
  const response = await api.get(`/donor/profile/${donorId}`);
  return response.data;
}

/**
 * Send individual request notification to a specific donor (SMS + in-app).
 */
export async function sendIndividualRequest(requestId: string, donorId: string) {
  const response = await api.post(`/requests/${requestId}/notify-donor`, {
    donor_id: donorId,
  });
  return response.data;
}
