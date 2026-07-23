export interface Permission {
  id: number;
  codename: string;
  name: string;
  app_label: string;
  model_name: string;
}

export interface PermissionFormData {
  codename: string;
  name: string;
  app_label: string;
  model_name: string;
}

export interface PermissionFilters {
  search: string;
  app?: string;
  model?: string;
}

export interface PaginatedPermissionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Permission[];
}

export interface AssignPermissionsPayload {
  permissions: number[];
}

export interface RolePermissionAssignment {
  roleId: number;
  roleName: string;
  permissions: Permission[];
}
