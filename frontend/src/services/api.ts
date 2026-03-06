import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ss_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url?.includes('/api/auth/login') && !err.config.url?.includes('/api/auth/register')) {
      localStorage.removeItem('ss_access_token');
      localStorage.removeItem('ss_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
