import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/api';

export interface DashboardStats {
  total_users: number;
  total_roles: number;
  total_permissions: number;
  online_users: number;
  recent_activities: Array<{
    id: number;
    user: string | null;
    action: string;
    action_code: string;
    model_name: string;
    object_id: string;
    details: Record<string, unknown>;
    timestamp: string;
  }>;
}

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      const [usersRes, rolesRes, permsRes, auditRes] = await Promise.all([
        apiClient.get('/accounts/users/').then((r) => r.data),
        apiClient.get('/accounts/roles/').then((r) => r.data),
        apiClient.get('/accounts/permissions/').then((r) => r.data),
        apiClient.get('/accounts/audit-log/', { params: { limit: 10 } }).then((r) => r.data),
      ]);

      const totalUsers = usersRes.count || usersRes.length || 0;
      const totalRoles = rolesRes.length || 0;
      const totalPermissions = permsRes.length || 0;

      // Approximate online users: users with recent activity in audit log
      const recentUserIds = new Set(
        auditRes
          .filter((log: any) => log.user && ['LOGIN', 'ASSIGN_ROLE', 'UPDATE'].includes(log.action_code))
          .map((log: any) => log.user)
      );
      const onlineUsers = recentUserIds.size;

      return {
        total_users: totalUsers,
        total_roles: totalRoles,
        total_permissions: totalPermissions,
        online_users: onlineUsers,
        recent_activities: auditRes,
      };
    },
  });
};
