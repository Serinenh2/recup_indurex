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

export interface AuditLogFilters {
  search?: string;
  action?: string;
  user?: string;
  model_name?: string;
  ip_address?: string;
  date_from?: string;
  date_to?: string;
}

export interface PaginatedAuditLogResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLogEntry[];
}
