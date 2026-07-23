import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { JWTResponse } from '../types';
import { useAuthStore } from '../store/authStore';

// ── Configuration ─────────────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ── Axios Instance ────────────────────────────────────────────────────────────
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Attach Access Token ──────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore.getState();
    const accessToken = authStore.accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 & Refresh Token ──────────────────────────
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const refreshToken = async (): Promise<string> => {
  const authStore = useAuthStore.getState();
  const refresh = authStore.refreshToken;
  if (!refresh) throw new Error('No refresh token');

  const response = await axios.post<JWTResponse>(`${API_BASE_URL}/auth/token/refresh/`, {
    refresh,
  });

  const newAccess = response.data.access;
  useAuthStore.getState().setCredentials({ access: newAccess, refresh }, authStore.rememberMe);
  return newAccess;
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue request until refresh completes
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccess = await refreshToken();
        pendingRequests.forEach((cb) => cb(newAccess));
        pendingRequests = [];
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear tokens and redirect to login
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
