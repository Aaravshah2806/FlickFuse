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
  isInitialized: boolean;
  syncFromClerk: (clerkUserId: string | null | undefined, getToken: (() => Promise<string | null>) | null) => Promise<void>;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,

  syncFromClerk: async (clerkUserId, getToken) => {
    if (!clerkUserId || !getToken) {
      set({ user: null, isInitialized: true });
      return;
    }

    try {
      // Get a fresh token from Clerk and store it for the API interceptor
      const token = await getToken();
      if (token) {
        localStorage.setItem('ss_access_token', token);
      }

      // Fetch the user profile from our backend
      const { data } = await api.get('/api/auth/me');
      const user: User = {
        id: data.id,
        email: data.email,
        username: data.username,
        uniqueId: data.uniqueId,
        displayName: data.displayName,
        profilePictureUrl: data.profilePictureUrl,
        bio: data.bio,
        privacySettings: data.privacySettings,
      };
      set({ user, isInitialized: true });
    } catch {
      // Backend might not have this user yet — that's okay, auto-provisioning handles it
      set({ user: null, isInitialized: true });
    }
  },

  setUser: (user) => set({ user }),
  clearUser: () => {
    localStorage.removeItem('ss_access_token');
    set({ user: null });
  },
}));
