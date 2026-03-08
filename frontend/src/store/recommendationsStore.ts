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
  alerts: any[];
  isLoading: boolean;
  error: string | null;
  source: 'database' | 'mock' | null;
  fetch: (maxRuntime?: number) => Promise<void>;
  generate: (maxRuntime?: number) => Promise<void>;
  groupGenerate: (friendIds: string[], maxRuntime?: number) => Promise<void>;
  fetchReleaseRadar: () => Promise<void>;
  submitFeedback: (id: string, feedback: string) => Promise<void>;
}

export const useRecommendationsStore = create<RecommendationsState>((set, get) => ({
  recommendations: [],
  alerts: [],
  isLoading: false,
  error: null,
  source: null,

  fetch: async (maxRuntime) => {
    set({ isLoading: true, error: null });
    try {
      const url = maxRuntime ? `/api/recommendations?max_runtime=${maxRuntime}` : '/api/recommendations';
      const { data } = await api.get(url);
      set({ recommendations: data.recommendations, source: data.source, isLoading: false });
    } catch {
      set({ error: 'Failed to load recommendations', isLoading: false });
    }
  },

  generate: async (maxRuntime) => {
    set({ isLoading: true, error: null });
    try {
      const url = maxRuntime ? `/api/recommendations/generate?max_runtime=${maxRuntime}` : '/api/recommendations/generate';
      await api.post(url);
      await get().fetch(maxRuntime);
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: { error?: string, detail?: string } } }).response?.data;
      const msg = responseData?.error || responseData?.detail || 'Failed to generate';
      set({ error: msg, isLoading: false });
    }
  },

  groupGenerate: async (friendIds, maxRuntime) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/api/recommendations/group', { friend_ids: friendIds, max_runtime: maxRuntime });
      set({ recommendations: data.recommendations, source: 'mock', isLoading: false });
    } catch (err: unknown) {
      set({ error: 'Failed to generate group recommendations', isLoading: false });
    }
  },

  fetchReleaseRadar: async () => {
    try {
      const { data } = await api.get('/api/recommendations/release-radar');
      set({ alerts: data.alerts });
    } catch { /* silent */ }
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
