import axios from 'axios';
import {
  User,
  Field,
  FieldUpdate,
  DashboardData,
  LoginCredentials,
  LoginResponse,
  PaginatedResponse,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const authAPI = {
  login: (credentials: LoginCredentials): Promise<LoginResponse> =>
    api.post('/auth/login/', credentials).then(res => res.data),
  
  logout: (): Promise<{ message: string }> =>
    api.post('/auth/logout/').then(res => res.data),
  
  getCurrentUser: (): Promise<User> =>
    api.get('/auth/user/').then(res => res.data),
};

export const fieldAPI = {
  getFields: (): Promise<PaginatedResponse<Field> | Field[]> =>
    api.get('/fields/').then(res => res.data),
  
  getField: (id: number): Promise<Field> =>
    api.get(`/fields/${id}/`).then(res => res.data),
  
  createField: (fieldData: Partial<Field>): Promise<Field> =>
    api.post('/fields/', fieldData).then(res => res.data),
  
  updateField: (id: number, fieldData: Partial<Field>): Promise<Field> =>
    api.put(`/fields/${id}/`, fieldData).then(res => res.data),
  
  addFieldUpdate: (fieldId: number, updateData: { stage: string; note: string }): Promise<FieldUpdate> =>
    api.post(`/fields/${fieldId}/add_update/`, updateData).then(res => res.data),
};

export const dashboardAPI = {
  getDashboard: (): Promise<DashboardData> =>
    api.get('/dashboard/').then(res => res.data),
};

export const userAPI = {
  getUsers: (): Promise<PaginatedResponse<User> | User[]> =>
    api.get('/users/').then(res => res.data),
  
  getCurrentUser: (): Promise<User> =>
    api.get('/users/me/').then(res => res.data),
};

export default api;
