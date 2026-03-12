import { create } from 'zustand';
import api from '../services/api';

export interface WatchEvent {
  id: string;
  watchedAt: string | null;
  progressPercent: number | null;
  platform: string;
  catalogId: string;
  title: string;
  contentType: string | null;
  genres: string[] | null;
  posterPath: string | null;
}

interface WatchHistoryState {
  history: WatchEvent[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
}

export const useWatchHistoryStore = create<WatchHistoryState>((set) => ({
  history: [],
  isLoading: false,
  error: null,

  fetchHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/api/watch-events');
      set({ history: data.watchHistory || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch watch history', isLoading: false });
    }
  },
}));
