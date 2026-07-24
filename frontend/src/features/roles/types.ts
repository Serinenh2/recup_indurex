import type { Role as GlobalRole, Permission as GlobalPermission } from '../../types';

// Re-export global types used by this feature
export type { GlobalRole as Role, GlobalPermission as Permission };

export interface RoleDetail extends GlobalRole {
  permissions: GlobalPermission[];
  users: Array<{
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  }>;
}

export interface RoleFormData {
  name: string;
  permissions: number[];
}

export interface RoleFilters {
  search?: string;
}

export interface PaginatedRolesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Role[];
}
