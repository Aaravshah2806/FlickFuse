import { act } from '@testing-library/react';

// Mock the api module
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const mockGet = api.get as ReturnType<typeof vi.fn>;

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset store to initial state
    useAuthStore.setState({ user: null, isInitialized: false });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('starts with null user and isInitialized: false', () => {
      const { user, isInitialized } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(isInitialized).toBe(false);
    });
  });

  describe('syncFromClerk', () => {
    it('sets user to null and isInitialized: true if clerkUserId is missing', async () => {
      await act(async () => {
        await useAuthStore.getState().syncFromClerk(null, null);
      });

      const { user, isInitialized } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(isInitialized).toBe(true);
    });

    it('sets user and isInitialized: true on successful sync', async () => {
      const fakeUser = {
        id: '11111111-2222-3333-4444-555555555555',
        email: 'alice@test.com',
        username: 'alice',
        uniqueId: 'A1',
      };
      const mockGetToken = vi.fn().mockResolvedValue('fake-token');
      mockGet.mockResolvedValueOnce({ data: fakeUser });

      await act(async () => {
        await useAuthStore.getState().syncFromClerk('user_123', mockGetToken);
      });

      const { user, isInitialized } = useAuthStore.getState();
      expect(user?.email).toBe('alice@test.com');
      expect(isInitialized).toBe(true);
      expect(localStorage.getItem('ss_access_token')).toBe('fake-token');
    });

    it('sets user to null and isInitialized: true on sync failure', async () => {
      const mockGetToken = vi.fn().mockResolvedValue('fake-token');
      mockGet.mockRejectedValueOnce(new Error('Backend error'));

      await act(async () => {
        await useAuthStore.getState().syncFromClerk('user_123', mockGetToken);
      });

      const { user, isInitialized } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(isInitialized).toBe(true);
    });
  });

  describe('setUser', () => {
    it('updates user state', () => {
      const fakeUser = { id: 'u1', email: 'a@a.com', username: 'a', uniqueId: 'U1' };
      act(() => {
        useAuthStore.getState().setUser(fakeUser);
      });
      expect(useAuthStore.getState().user).toEqual(fakeUser);
    });
  });

  describe('clearUser', () => {
    it('clears user state and localStorage', () => {
      useAuthStore.setState({ user: { id: 'u1' } as any });
      localStorage.setItem('ss_access_token', 'token');

      act(() => {
        useAuthStore.getState().clearUser();
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(localStorage.getItem('ss_access_token')).toBeNull();
    });
  });
});
