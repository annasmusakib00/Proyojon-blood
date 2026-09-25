import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  phone: string;
  bloodGroup: string;
  profilePhoto?: string | null;
  isAvailable: boolean;
  isLocked: boolean;
  lockEndDate?: string | null;
  donationCount: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => Promise<void>;
  loadToken: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (token, user) => {
    await SecureStore.setItemAsync('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await AsyncStorage.removeItem('auth_user');
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  setUser: async (user) => {
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    set({ user });
  },

  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const userStr = await AsyncStorage.getItem('auth_user');
        const user = userStr ? JSON.parse(userStr) : null;
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
