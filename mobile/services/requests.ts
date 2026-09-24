import api from './api';

export interface CreateRequestData {
  blood_group: string;
  bags_needed: number;
  hospital_name: string;
  hospital_lat: number;
  hospital_lng: number;
  conveyance_amount: number;
  agreement_accepted: boolean;
}

/**
 * Create a new blood request and broadcast to nearby donors.
 */
export async function createRequest(data: CreateRequestData) {
  const response = await api.post('/requests', data);
  return response.data;
}

/**
 * Get a single request by ID.
 */
export async function getRequest(id: string) {
  const response = await api.get(`/requests/${id}`);
  return response.data;
}

/**
 * Accept a blood request (going myself).
 */
export async function acceptRequest(id: string) {
  const response = await api.post(`/requests/${id}/accept`, { type: 'self' });
  return response.data;
}

/**
 * Submit a proxy donor for a request.
 */
export async function submitProxy(id: string, proxyName: string, proxyPhone: string) {
  const response = await api.post(`/requests/${id}/proxy`, {
    proxy_name: proxyName,
    proxy_phone: proxyPhone,
  });
  return response.data;
}

/**
 * Decline a blood request.
 */
export async function declineRequest(id: string) {
  const response = await api.post(`/requests/${id}/decline`);
  return response.data;
}

/**
 * Update journey status (IN_PROGRESS or ARRIVED).
 */
export async function updateStatus(id: string, status: 'IN_PROGRESS' | 'ARRIVED') {
  const response = await api.patch(`/requests/${id}/status`, { status });
  return response.data;
}

/**
 * Confirm donation completion (requester only).
 */
export async function completeRequest(id: string) {
  const response = await api.post(`/requests/${id}/complete`);
  return response.data;
}

/**
 * Get request history for the user.
 */
export async function getHistory(role: 'requester' | 'donor') {
  const response = await api.get(`/requests/history?role=${role}`);
  return response.data;
}
