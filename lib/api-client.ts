import axios from 'axios';

// Strip trailing slash so baseURL is always correct (Vercel env may include slash)
const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const API_URL = typeof raw === 'string' ? raw.replace(/\/$/, '') : raw;

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}
