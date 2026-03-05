// Test the axios instance interceptors from services/api.ts
// We mock axios to isolate the interceptor logic.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We'll test the behaviour via localStorage state + mocking axios internals.

describe('api service – request interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('attaches Authorization header when ss_access_token is in localStorage', async () => {
    localStorage.setItem('ss_access_token', 'my-test-token');

    // Dynamically re-import so interceptors are registered fresh
    const { default: api } = await import('../services/api');

    // Run the request interceptor manually against a fake config
    const interceptor = (api.interceptors.request as any).handlers.at(-1);
    const config = { headers: {} as Record<string, string> };
    const result = interceptor?.fulfilled(config);

    expect(result.headers['Authorization']).toBe('Bearer my-test-token');
  });

  it('does NOT attach Authorization header when no token in localStorage', async () => {
    const { default: api } = await import('../services/api');

    const interceptor = (api.interceptors.request as any).handlers.at(-1);
    const config = { headers: {} as Record<string, string> };
    const result = interceptor?.fulfilled(config);

    expect(result.headers['Authorization']).toBeUndefined();
  });
});

describe('api service – response interceptor (401 handling)', () => {
  beforeEach(() => {
    localStorage.setItem('ss_access_token', 'some-token');
    localStorage.setItem('ss_user', JSON.stringify({ id: 'u1' }));
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    // Reset window.location.href to avoid cross-test pollution
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('clears localStorage and redirects to /login on 401 error', async () => {
    // Set up a fake window.location
    delete (window as any).location;
    (window as any).location = { href: '' };

    const { default: api } = await import('../services/api');

    const responseInterceptor = (api.interceptors.response as any).handlers.at(-1);
    const err = { response: { status: 401 } };

    // Call the rejected handler and expect it to throw
    await expect(responseInterceptor?.rejected(err)).rejects.toEqual(err);

    expect(localStorage.getItem('ss_access_token')).toBeNull();
    expect(localStorage.getItem('ss_user')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('passes through non-401 errors without clearing localStorage', async () => {
    const { default: api } = await import('../services/api');

    const responseInterceptor = (api.interceptors.response as any).handlers.at(-1);
    const err = { response: { status: 500 } };

    await expect(responseInterceptor?.rejected(err)).rejects.toEqual(err);

    // localStorage should remain intact for non-401 errors
    expect(localStorage.getItem('ss_access_token')).toBe('some-token');
  });
});
