// Re-export types from global types
import type { User as _User, UserRole as _UserRole } from '../../types';
export type User = _User;
export type UserRole = _UserRole;

export interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string;
  wilaya: string;
  password?: string;
  is_active?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  wilaya?: string;
}

export interface AssignRolePayload {
  role: UserRole;
}

export interface ResetPasswordPayload {
  new_password: string;
}

export interface PaginatedUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}
