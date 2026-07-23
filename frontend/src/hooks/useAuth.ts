import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import apiClient from '../services/api';
import type { User, JWTResponse } from '../types';

// ── Keys ──────────────────────────────────────────────────────────────────────
export const authKeys = {
  me: ['auth', 'me'] as const,
};

// ── API Functions ─────────────────────────────────────────────────────────────
export const login = async (credentials: { username: string; password: string }): Promise<JWTResponse> => {
  const response = await apiClient.post<JWTResponse>('/auth/token/', credentials);
  return response.data;
};

export const refreshAccessToken = async (): Promise<JWTResponse> => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token');
  const response = await apiClient.post<JWTResponse>('/auth/token/refresh/', { refresh });
  return response.data;
};

export const fetchCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/accounts/me/');
  return response.data;
};

export const updateCurrentUser = async (data: Partial<User>): Promise<User> => {
  const response = await apiClient.patch<User>('/accounts/me/', data);
  return response.data;
};

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setCredentials(data);
      // Pre-fetch user data
      queryClient.prefetchQuery({ queryKey: authKeys.me, queryFn: fetchCurrentUser });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (data) => {
      updateUser(data);
      queryClient.setQueryData(authKeys.me, data);
    },
  });
};
