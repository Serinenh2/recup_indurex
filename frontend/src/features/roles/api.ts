import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/api';
import type { RoleDetail, RoleFilters, RoleFormData, PaginatedRolesResponse } from './types';
import type { Role } from '../../types';

export const rolesKeys = {
  all: ['roles'] as const,
  list: (filters?: RoleFilters) => [...rolesKeys.all, 'list', filters] as const,
  detail: (id: number) => [...rolesKeys.all, 'detail', id] as const,
};

export const useRolesList = (filters?: RoleFilters) => {
  return useQuery({
    queryKey: rolesKeys.list(filters),
    queryFn: async (): Promise<PaginatedRolesResponse> => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);

      const res = await apiClient.get<PaginatedRolesResponse>('/accounts/roles/', { params });
      return res.data;
    },
  });
};

export const useRoleDetail = (id: number) => {
  return useQuery({
    queryKey: rolesKeys.detail(id),
    queryFn: async (): Promise<RoleDetail> => {
      const res = await apiClient.get<RoleDetail>(`/accounts/roles/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await apiClient.post<Role>('/accounts/roles/', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string } }) => {
      const res = await apiClient.put<Role>(`/accounts/roles/${id}/`, data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      queryClient.setQueryData(rolesKeys.detail(variables.id), data);
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/accounts/roles/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
  });
};

export const useCloneRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.post<Role>(`/accounts/roles/${id}/clone/`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, permissions }: { id: number; permissions: number[] }) => {
      const res = await apiClient.put(`/accounts/roles/${id}/permissions/`, { permissions });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
  });
};
