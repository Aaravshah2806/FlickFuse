import { create } from 'zustand';
import api from '../services/api';

export interface UserList {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  visibility: 'public' | 'friends' | 'private';
  tags?: string[];
  created_at: string;
  item_count?: number;
}

interface ListsState {
  lists: UserList[];
  upNextListId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchLists: () => Promise<void>;
  fetchUpNext: () => Promise<void>;
  createList: (title: string, description: string, visibility: string) => Promise<UserList>;
  updateList: (id: string, updates: Partial<UserList>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
}

export const useListsStore = create<ListsState>((set) => ({
  lists: [],
  upNextListId: null,
  isLoading: false,
  error: null,

  fetchLists: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/api/lists');
      set({ lists: data.lists, isLoading: false });
    } catch { set({ error: 'Failed to load lists', isLoading: false }); }
  },

  fetchUpNext: async () => {
    try {
      const { data } = await api.get('/api/lists/up-next');
      set({ upNextListId: data.list.id });
    } catch { /* silent */ }
  },

  createList: async (title, description, visibility) => {
    const { data } = await api.post('/api/lists', { title, description, visibility });
    set((s) => ({ lists: [data.list, ...s.lists] }));
    return data.list;
  },

  updateList: async (id, updates) => {
    const { data } = await api.put(`/api/lists/${id}`, updates);
    set((s) => ({ lists: s.lists.map((l) => l.id === id ? data.list : l) }));
  },

  deleteList: async (id) => {
    await api.delete(`/api/lists/${id}`);
    set((s) => ({ lists: s.lists.filter((l) => l.id !== id) }));
  },
}));
