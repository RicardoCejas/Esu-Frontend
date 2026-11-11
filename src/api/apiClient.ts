import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage, refreshSingleFlight } from './tokenStorage';
import { getCsrfTokenFromCookie } from '@/lib/sanitizer';
import { authBroadcast } from '@/lib/authBroadcast';
import { authSessionStorage } from '@/lib/authSessionStorage';

function normalizeBaseUrl(rawUrl?: string): string {
  if (!rawUrl || !rawUrl.trim()) {
    return import.meta.env.DEV ? 'http://localhost:8080/api' : '/api';
  }
  let clean = rawUrl.trim().replace(/\/+$/, '');
  if (clean.startsWith('http') && !clean.endsWith('/api')) {
    clean += '/api';
  }
  return clean;
}

const BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
  withCredentials: true,
});

// Interceptor de petición: inyecta Access Token desde memoria y token anti-CSRF (HU-41 / HU-44)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Token JWT en memoria volátil (NO localStorage)
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Sincronización de token Anti-CSRF si existe la cookie
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken && config.headers && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de respuesta con renovación transparente mediante Refresh Token seguro (HTTP-only)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const url = originalRequest?.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/registro') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/google');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshSingleFlight.run(async () => {
          const refreshResponse = await axios.post<{ accessToken?: string; token?: string }>(
            `${BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          const extracted = refreshResponse.data.accessToken || refreshResponse.data.token || null;
          if (extracted) {
            tokenStorage.setAccessToken(extracted);
          }
          return extracted;
        });

        if (newAccessToken) {
          processQueue(null, newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error('No se recibió nuevo access token');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (typeof window !== 'undefined') {
          tokenStorage.clearToken();
          authSessionStorage.clearSessionActive();
          authBroadcast.postMessage({ type: 'LOGOUT', reason: 'expired' });
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
