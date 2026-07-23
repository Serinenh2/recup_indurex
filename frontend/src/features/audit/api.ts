import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/api';
import type { AuditLogFilters, AuditLogEntry } from './types';

export const auditKeys = {
  all: ['audit'] as const,
  list: (filters?: AuditLogFilters) => [...auditKeys.all, 'list', filters] as const,
};

export const useAuditLogList = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: async (): Promise<AuditLogEntry[]> => {
      const params: Record<string, string> = {};
      if (filters?.search) params.search = filters.search;
      if (filters?.action) params.action = filters.action;
      if (filters?.user) params.user = filters.user;
      if (filters?.model_name) params.model_name = filters.model_name;
      if (filters?.ip_address) params.ip_address = filters.ip_address;
      if (filters?.date_from) params.date_from = filters.date_from;
      if (filters?.date_to) params.date_to = filters.date_to;

      const res = await apiClient.get<AuditLogEntry[]>('/accounts/audit-log/', { params });
      return res.data;
    },
  });
};
