// ── Global Types ──────────────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  role_display: string;
  phone: string;
  wilaya: string;
  is_superuser: boolean;
  is_active: boolean;
  is_staff: boolean;
  recuperateur_id: number | null;
  recuperateur_nom: string | null;
  permissions: string[];
  groups: string[];
}

export type UserRole =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'RECUPERATEUR'
  | 'RESPONSABLE_COLLECTE'
  | 'AGENT_COLLECTE'
  | 'RESPONSABLE_DECHARGE'
  | 'OBSERVATEUR';

export interface Role {
  id: number;
  name: string;
  permissions_list: string[];
  user_count: number;
}

export interface Permission {
  id: number;
  codename: string;
  name: string;
  app_label: string;
  model_name: string;
}

export interface AuditLogEntry {
  id: number;
  user: string | null;
  action: string;
  action_code: string;
  model_name: string;
  object_id: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  timestamp: string;
}

export interface JWTResponse {
  refresh: string;
  access: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  error?: string;
  detail?: string;
  code?: string;
  [key: string]: unknown;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember_me?: boolean;
}
