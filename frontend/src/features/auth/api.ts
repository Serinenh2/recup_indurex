import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/api';
import type { AxiosError } from 'axios';
import type { User } from '../../types';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { username: string; password: string; remember_me?: boolean }) => {
      const tokenRes = await apiClient.post('/auth/token/', {
        username: credentials.username,
        password: credentials.password,
      });
      const tokens = tokenRes.data;

      // Set token in axios defaults
      apiClient.defaults.headers.common.Authorization = `Bearer ${tokens.access}`;

      // Fetch user profile with the new token
      const userRes = await apiClient.get<User>('/accounts/me/');

      return { ...tokens, user: userRes.data, remember_me: credentials.remember_me };
    },
    onSuccess: (data) => {
      // Store in auth store (which handles localStorage vs sessionStorage)
      import('../../store/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().setCredentials(data, data.remember_me);
        useAuthStore.getState().setUser(data.user);
      });
      queryClient.setQueryData(authKeys.me, data.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      // Clear axios auth header
      delete apiClient.defaults.headers.common.Authorization;
    },
    onSettled: () => {
      import('../../store/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
      });
      queryClient.clear();
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async (): Promise<User> => {
      const res = await apiClient.get<User>('/accounts/me/');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 401/403
      const status = (error as AxiosError)?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>): Promise<User> => {
      const res = await apiClient.patch<User>('/accounts/me/', data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me, data);
    },
  });
};
