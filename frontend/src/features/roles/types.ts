import type { Role, Permission } from '../../types';

export interface RoleDetail extends Role {
  permissions: Permission[];
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
