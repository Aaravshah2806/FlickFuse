import { create } from 'zustand';
import api from '../services/api';

export interface Friend {
  friendshipId: string;
  friendId: string;
  username: string;
  uniqueId: string;
  displayName?: string;
  profilePictureUrl?: string;
  tasteProfile?: { genreVector: Record<string, number>; languagePreferences: Record<string, number> } | null;
  friendsSince?: string;
}

export interface FriendRequest {
  requestId: string;
  requesterId: string;
  username: string;
  uniqueId: string;
  displayName?: string;
  requestedAt: string;
}

interface FriendsState {
  friends: Friend[];
  requests: FriendRequest[];
  isLoading: boolean;
  error: string | null;
  fetchFriends: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  sendRequest: (uniqueId: string) => Promise<{ username: string; uniqueId: string }>;
  acceptRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendshipId: string) => Promise<void>;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  requests: [],
  isLoading: false,
  error: null,

  fetchFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/api/friends');
      set({ friends: data.friends, isLoading: false });
    } catch { set({ error: 'Failed to load friends', isLoading: false }); }
  },

  fetchRequests: async () => {
    try {
      const { data } = await api.get('/api/friends/requests');
      set({ requests: data.requests });
    } catch { /* silent */ }
  },

  sendRequest: async (uniqueId) => {
    const { data } = await api.post('/api/friends/request', { uniqueId });
    return data.friend;
  },

  acceptRequest: async (requestId) => {
    await api.post(`/api/friends/${requestId}/accept`);
    set((s) => ({ requests: s.requests.filter((r) => r.requestId !== requestId) }));
    get().fetchFriends();
  },

  removeFriend: async (friendshipId) => {
    await api.delete(`/api/friends/${friendshipId}`);
    set((s) => ({ friends: s.friends.filter((f) => f.friendshipId !== friendshipId) }));
  },
}));
