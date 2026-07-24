// Re-export types from global types
import type { Role as _Role, Permission as _Permission } from '../../types';
export type Role = _Role;
export type Permission = _Permission;

export interface RoleDetail extends _Role {
  permissions: _Permission[];
  permissions_list: string[];
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
