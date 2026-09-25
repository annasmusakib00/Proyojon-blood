import api from './api';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

/**
 * Register a new user. Sends OTP to the provided phone.
 */
export async function register(name: string, phone: string, bloodGroup: string, password?: string) {
  const response = await api.post('/auth/register', {
    name,
    phone,
    blood_group: bloodGroup,
    password,
  });
  return response.data;
}

/**
 * Verify OTP and receive JWT + user data.
 * Saves the token to SecureStore on success.
 */
export async function verifyOtp(phone: string, otp: string) {
  const response = await api.post('/auth/verify-otp', { phone, otp });
  const { token, user } = response.data.data;

  // Save token securely
  await SecureStore.setItemAsync(TOKEN_KEY, token);

  return { token, user };
}

/**
 * Login with phone and password.
 */
export async function login(phone: string, password?: string) {
  const response = await api.post('/auth/login', { phone, password });
  const { token, user } = response.data.data;

  // Save token securely
  await SecureStore.setItemAsync(TOKEN_KEY, token);

  return { token, user };
}

/**
 * Get the stored auth token.
 */
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Clear auth token and log out.
 */
export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
