import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/api';
import type { AxiosError } from 'axios';
import type { User } from '../../types';
import { authKeys } from '../../hooks/useAuth';

export { authKeys };

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

export { useCurrentUser } from '../../hooks/useAuth';
export { useUpdateProfile } from '../../hooks/useAuth';
