import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';

// Mock the api module before importing the store
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const mockPost = api.post as ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  // Reset store to initial state
  useAuthStore.setState({ user: null, token: null, isLoading: false, error: null });
});

afterEach(() => {
  localStorage.clear();
});

// ─── Initial state ─────────────────────────────────────────────────────────────
describe('authStore – initial state', () => {
  it('starts with null user and token', () => {
    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it('starts with isLoading: false and error: null', () => {
    const { isLoading, error } = useAuthStore.getState();
    expect(isLoading).toBe(false);
    expect(error).toBeNull();
  });
});

// ─── loadFromStorage ───────────────────────────────────────────────────────────
describe('authStore – loadFromStorage', () => {
  it('populates user and token from localStorage', () => {
    const fakeUser = { id: 'u1', email: 'alice@test.com', username: 'alice', uniqueId: 'A#1' };
    localStorage.setItem('ss_access_token', 'test-token');
    localStorage.setItem('ss_user', JSON.stringify(fakeUser));

    act(() => {
      useAuthStore.getState().loadFromStorage();
    });

    const { user, token } = useAuthStore.getState();
    expect(user?.email).toBe('alice@test.com');
    expect(token).toBe('test-token');
  });

  it('does not change state when localStorage has no token', () => {
    act(() => {
      useAuthStore.getState().loadFromStorage();
    });

    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });
});

// ─── login ────────────────────────────────────────────────────────────────────
describe('authStore – login action', () => {
  it('sets user, token, and localStorage on successful login', async () => {
    const fakeUser = { id: 'u1', email: 'alice@test.com', username: 'alice', uniqueId: 'A#1' };
    mockPost.mockResolvedValueOnce({
      data: { user: fakeUser, accessToken: 'access-token-123' },
    });

    await act(async () => {
      await useAuthStore.getState().login('alice@test.com', 'Password123');
    });

    const { user, token } = useAuthStore.getState();
    expect(user?.email).toBe('alice@test.com');
    expect(token).toBe('access-token-123');
    expect(localStorage.getItem('ss_access_token')).toBe('access-token-123');
    expect(localStorage.getItem('ss_user')).toBe(JSON.stringify(fakeUser));
  });

  it('sets error on failed login and re-throws', async () => {
    const apiError = { response: { data: { error: 'Invalid email or password' } } };
    mockPost.mockRejectedValueOnce(apiError);

    await expect(
      act(async () => {
        await useAuthStore.getState().login('bad@test.com', 'WrongPass');
      })
    ).rejects.toEqual(apiError);

    const { error, user } = useAuthStore.getState();
    expect(error).toBe('Invalid email or password');
    expect(user).toBeNull();
  });

  it('sets isLoading: true during login and false after', async () => {
    let loadingDuringRequest = false;
    mockPost.mockImplementationOnce(async () => {
      loadingDuringRequest = useAuthStore.getState().isLoading;
      return { data: { user: { id: 'u1', email: 'a@a.com', username: 'a', uniqueId: 'A#1' }, accessToken: 'tok' } };
    });

    await act(async () => {
      await useAuthStore.getState().login('alice@test.com', 'Password123');
    });

    expect(loadingDuringRequest).toBe(true);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────
describe('authStore – logout action', () => {
  it('clears user, token, and localStorage on logout', () => {
    // Pre-populate state
    useAuthStore.setState({
      user: { id: 'u1', email: 'a@a.com', username: 'a', uniqueId: 'A#1' },
      token: 'old-token',
    });
    localStorage.setItem('ss_access_token', 'old-token');
    localStorage.setItem('ss_user', JSON.stringify({ id: 'u1' }));

    act(() => {
      useAuthStore.getState().logout();
    });

    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(localStorage.getItem('ss_access_token')).toBeNull();
    expect(localStorage.getItem('ss_user')).toBeNull();
  });
});

// ─── clearError ───────────────────────────────────────────────────────────────
describe('authStore – clearError action', () => {
  it('resets error to null', () => {
    useAuthStore.setState({ error: 'Some previous error' });

    act(() => {
      useAuthStore.getState().clearError();
    });

    expect(useAuthStore.getState().error).toBeNull();
  });
});
