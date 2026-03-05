import { create } from 'zustand';
import api from '../services/api';

export interface Recommendation {
  id?: string;
  catalogId?: string;
  title: string;
  matchScore: number;
  reason: string;
  genres?: string[];
  contentType?: string;
  synopsis?: string;
  ratings?: Record<string, number>;
  platforms?: string[];
  posterPath?: string;
  tmdbId?: number;
  userFeedback?: string;
  generatedAt?: string;
  platform?: string; // mock fallback
}

interface RecommendationsState {
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
  source: 'database' | 'mock' | null;
  fetch: () => Promise<void>;
  generate: () => Promise<void>;
  submitFeedback: (id: string, feedback: string) => Promise<void>;
}

export const useRecommendationsStore = create<RecommendationsState>((set, get) => ({
  recommendations: [],
  isLoading: false,
  error: null,
  source: null,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/api/recommendations');
      set({ recommendations: data.recommendations, source: data.source, isLoading: false });
    } catch {
      set({ error: 'Failed to load recommendations', isLoading: false });
    }
  },

  generate: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/recommendations/generate');
      await get().fetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to generate';
      set({ error: msg, isLoading: false });
    }
  },

  submitFeedback: async (id, feedback) => {
    await api.post(`/api/recommendations/${id}/feedback`, { feedback });
    set((s) => ({
      recommendations: s.recommendations.filter((r) => {
        if (r.id !== id) return true;
        if (feedback === 'not_interested') return false;
        return true;
      }).map((r) => r.id === id ? { ...r, userFeedback: feedback } : r),
    }));
  },
}));
