import type { User as GlobalUser, UserRole as GlobalUserRole } from '../../types';

// Re-export global types used by this feature
export type { GlobalUser as User, GlobalUserRole as UserRole };

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
