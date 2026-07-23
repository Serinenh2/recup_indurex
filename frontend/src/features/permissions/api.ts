import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/api';
import type { Permission, PermissionFilters, PaginatedPermissionsResponse, AssignPermissionsPayload } from './types';

export const permissionsKeys = {
  all: ['permissions'] as const,
  list: (filters?: PermissionFilters) => [...permissionsKeys.all, 'list', filters] as const,
  detail: (id: number) => [...permissionsKeys.all, 'detail', id] as const,
};

export const usePermissionsList = (filters?: PermissionFilters) => {
  return useQuery({
    queryKey: permissionsKeys.list(filters),
    queryFn: async (): Promise<Permission[]> => {
      const params: Record<string, string> = {};
      if (filters?.app) params.app = filters.app;
      if (filters?.model) params.model = filters.model;
      const res = await apiClient.get<Permission[]>('/accounts/permissions/', { params });
      let data = res.data;

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        data = data.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.codename.toLowerCase().includes(q) ||
            p.app_label.toLowerCase().includes(q) ||
            p.model_name.toLowerCase().includes(q)
        );
      }

      return data;
    },
  });
};

export const usePermissionDetail = (id: number) => {
  return useQuery({
    queryKey: permissionsKeys.detail(id),
    queryFn: async (): Promise<Permission> => {
      const res = await apiClient.get<Permission>(`/accounts/permissions/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useAssignPermissionsToRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: number; permissions: number[] }): Promise<{ status: string; permissions_count: number }> => {
      const res = await apiClient.put(`/accounts/roles/${roleId}/permissions/`, { permissions });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useBulkRemovePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }): Promise<{ status: string; permissions_count: number }> => {
      const res = await apiClient.put(`/accounts/roles/${roleId}/permissions/`, { permissions: [] });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};
