import { create } from 'zustand';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  uniqueId: string;
  displayName?: string;
  profilePictureUrl?: string;
  bio?: string;
  privacySettings?: Record<string, unknown>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  loadFromStorage: () => {
    const token = localStorage.getItem('ss_access_token');
    const userStr = localStorage.getItem('ss_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token });
      } catch { /* ignore */ }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('ss_access_token', data.accessToken);
      localStorage.setItem('ss_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.accessToken, isLoading: false });
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: { error?: string, detail?: string } } }).response?.data;
      const msg = responseData?.error || responseData?.detail || 'Login failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  register: async (email, password, username) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/api/auth/register', { email, password, username });
      localStorage.setItem('ss_access_token', data.accessToken);
      localStorage.setItem('ss_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.accessToken, isLoading: false });
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: { error?: string, detail?: string } } }).response?.data;
      const msg = responseData?.error || responseData?.detail || 'Registration failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('ss_access_token');
    localStorage.removeItem('ss_user');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));
