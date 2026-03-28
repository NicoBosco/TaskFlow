import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
  Project,
  CreateProjectPayload,
  Task,
  CreateTaskPayload,
  TaskFilters,
  ProjectStats,
  Subtask
} from '@/types';

import { getToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para inyectar token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Autenticación
export const authApi = {
  login: (payload: LoginPayload) => api.post<AuthResponse>('/auth/login', payload).then((r: AxiosResponse<AuthResponse>) => r.data),
  register: (payload: RegisterPayload) => api.post<AuthResponse>('/auth/register', payload).then((r: AxiosResponse<AuthResponse>) => r.data),
  getMe: () => api.get<User>('/auth/me').then((r: AxiosResponse<User>) => r.data),
  updateProfile: (payload: { name?: string; role?: string }) => api.patch<User>('/auth/me', payload).then((r: AxiosResponse<User>) => r.data),
};

// Proyectos
export const projectsApi = {
  getAll: (filters: { archived?: boolean; deleted?: boolean } = {}) => 
    api.get<Project[]>('/projects', { params: filters }).then((r: AxiosResponse<Project[]>) => r.data),
  
  getById: (id: number) => api.get<Project>(`/projects/${id}`).then((r: AxiosResponse<Project>) => r.data),
  
  create: (payload: CreateProjectPayload) => api.post<Project>('/projects', payload).then((r: AxiosResponse<Project>) => r.data),
  
  update: (id: number, payload: Partial<Project>) => api.put<Project>(`/projects/${id}`, payload).then((r: AxiosResponse<Project>) => r.data),
  
  archive: (id: number) => api.post<Project>(`/projects/${id}/archive`).then((r: AxiosResponse<Project>) => r.data),
  unarchive: (id: number) => api.post<Project>(`/projects/${id}/unarchive`).then((r: AxiosResponse<Project>) => r.data),
  restore: (id: number) => api.post<Project>(`/projects/${id}/restore`).then((r: AxiosResponse<Project>) => r.data),
  
  delete: (id: number) => api.delete(`/projects/${id}`).then((r: AxiosResponse) => r.data),
  permanentDelete: (id: number) => api.delete(`/projects/${id}/permanent`).then((r: AxiosResponse) => r.data),
};

// Tareas
export const tasksApi = {
  getByProject: (projectId: number, filters: TaskFilters) => 
    api.get<Task[]>(`/projects/${projectId}/tasks`, { params: filters }).then((r: AxiosResponse<Task[]>) => r.data),
  
  getById: (id: number) => api.get<Task>(`/tasks/${id}`).then((r: AxiosResponse<Task>) => r.data),
  
  create: (projectId: number, payload: CreateTaskPayload) => 
    api.post<Task>(`/projects/${projectId}/tasks`, payload).then((r: AxiosResponse<Task>) => r.data),
  
  update: (id: number, payload: Partial<Task>) => api.put<Task>(`/tasks/${id}`, payload).then((r: AxiosResponse<Task>) => r.data),
  
  archive: (id: number) => api.post<Task>(`/tasks/${id}/archive`).then((r: AxiosResponse<Task>) => r.data),
  unarchive: (id: number) => api.post<Task>(`/tasks/${id}/unarchive`).then((r: AxiosResponse<Task>) => r.data),
  restore: (id: number) => api.post<Task>(`/tasks/${id}/restore`).then((r: AxiosResponse<Task>) => r.data),
  
  delete: (id: number) => api.delete(`/tasks/${id}`).then((r: AxiosResponse) => r.data),
  permanentDelete: (id: number) => api.delete(`/tasks/${id}/permanent`).then((r: AxiosResponse) => r.data),
  
  getStats: (projectId: number) => api.get<ProjectStats>(`/projects/${projectId}/stats`).then((r: AxiosResponse<ProjectStats>) => r.data),
};

// Subtareas
export const subtasksApi = {
  getByTask: (taskId: number) => api.get<Subtask[]>(`/tasks/${taskId}/subtasks`).then((r: AxiosResponse<Subtask[]>) => r.data),
  create: (taskId: number, title: string) => api.post<Subtask>(`/tasks/${taskId}/subtasks`, { title }).then((r: AxiosResponse<Subtask>) => r.data),
  update: (id: number, payload: Partial<Subtask>) => api.put<Subtask>(`/subtasks/${id}`, payload).then((r: AxiosResponse<Subtask>) => r.data),
  delete: (id: number) => api.delete(`/subtasks/${id}`).then((r: AxiosResponse) => r.data),
};

export default api;
