import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

/**
 * Axios instance with base URL and auth interceptors.
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s for Render free tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

import { useAuthStore } from '../stores/authStore';

// Request interceptor — attach JWT from Zustand store or SecureStore
api.interceptors.request.use(
  async (config) => {
    try {
      let token = useAuthStore.getState().token;
      if (!token) {
        token = await SecureStore.getItemAsync('auth_token');
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[API] Failed to get token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and let the auth guard redirect to login
      try {
        useAuthStore.getState().logout();
      } catch (e) {
        console.error('[API] Failed to clear token:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
