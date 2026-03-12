import axios from 'axios';

type TokenProvider = () => Promise<string | null>;
let getToken: TokenProvider | null = null;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

/**
 * Register the Clerk getToken function to be used by the interceptor
 */
export const registerTokenProvider = (provider: TokenProvider) => {
  getToken = provider;
};

// Attach JWT token — try localStorage cache first, fall back to fresh Clerk token
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('ss_access_token');
  
  // If no token in storage but we have a provider, get a fresh one
  if (!token && getToken) {
    try {
      token = await getToken();
      if (token) {
        localStorage.setItem('ss_access_token', token);
      }
    } catch (err) {
      console.error('Failed to get fresh token:', err);
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 — clear cached token (Clerk will provide a fresh one on next request)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ss_access_token');
    }
    return Promise.reject(error);
  },
);

export default api;
