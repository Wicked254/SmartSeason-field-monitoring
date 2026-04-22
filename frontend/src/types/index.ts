export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

export interface FieldUpdate {
  id: number;
  agent: User;
  stage: FieldStage;
  note: string;
  created_at: string;
  field?: {
    id: number;
    name: string;
  };
}

export interface Field {
  id: number;
  name: string;
  crop_type: string;
  planting_date: string;
  current_stage: FieldStage;
  assigned_agent?: User;
  assigned_agent_id?: number;
  status: FieldStatus;
  status_label: string;
  status_css_class: string;
  created_at: string;
  updated_at: string;
  updates: FieldUpdate[];
}

export enum FieldStage {
  PLANTED = 'PLANTED',
  GROWING = 'GROWING',
  READY = 'READY',
  HARVESTED = 'HARVESTED'
}

export enum FieldStatus {
  ACTIVE = 'ACTIVE',
  AT_RISK = 'AT_RISK',
  COMPLETED = 'COMPLETED'
}

export interface DashboardData {
  is_admin: boolean;
  total_fields: number;
  status_counts: Record<FieldStatus, number>;
  recent_fields: Field[];
  recent_updates: FieldUpdate[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  message: string;
}
