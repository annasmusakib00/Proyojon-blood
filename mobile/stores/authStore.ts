import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

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

  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  loadToken: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: (token, user) => {
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user) => {
    set({ user });
  },

  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        set({ token, isAuthenticated: true, isLoading: false });
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
