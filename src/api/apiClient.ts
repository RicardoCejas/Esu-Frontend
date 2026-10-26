import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';
import { getCsrfTokenFromCookie } from '@/lib/sanitizer';
import { authBroadcast } from '@/lib/authBroadcast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
  withCredentials: true, // HU-41 / HU-69: Habilita el envío de cookies HttpOnly seguras (Refresh Token)
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

// Variables para control del refresco concurrente de tokens (HU-41)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de respuesta con captura de 401 y cola de peticiones concurrentes (HU-41)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Evitar loop si la petición fallida fue el propio refresh, login o logout
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/logout');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Encolar peticiones concurrentes mientras se renueva el token
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Solicitud silenciosa de rotación de token (HU-41)
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.accessToken || refreshResponse.data?.token;

        if (newAccessToken) {
          tokenStorage.setAccessToken(newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('Respuesta de refresh sin token válido');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clearToken();
        authBroadcast.postMessage({ type: 'LOGOUT', reason: 'expired' });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
