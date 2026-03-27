// TASKFLOW API — Definiciones de Tipos (v2)


export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: Date;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  due_date: string | null;
  archived_at: Date | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type ProjectStatus = 'active' | 'paused' | 'finished';
export type ProjectPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;       // DATE de PostgreSQL → ISO string
  tags: string[];                // TEXT[] de PostgreSQL
  archived_at: Date | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: number;
  task_id: number;
  title: string;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

// Auxiliares de estado (derivados, no persistidos)
export function isArchived(task: Task): boolean {
  return task.archived_at !== null;
}

export function isDeleted(task: Task): boolean {
  return task.deleted_at !== null;
}

// Estructuras de Datos (Payloads)

export interface CreateProjectPayload {
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  due_date?: string | null;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  due_date?: string | null;
  archived_at?: Date | null;
  deleted_at?: Date | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  tags?: string[];
}

export interface CreateSubtaskPayload {
  title: string;
}

export interface UpdateSubtaskPayload {
  title?: string;
  is_completed?: boolean;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  tags?: string[];
  archived_at?: Date | null;
  deleted_at?: Date | null;
}

// Filtros de Búsqueda
export type DueFilter = 'overdue' | 'next3' | 'next7' | 'long' | 'none' | '';

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  overdue?: boolean;    // Mantener para compatibilidad interna
  due_filter?: DueFilter;
  archived?: boolean;
  deleted?: boolean;
}

// Autenticación (Auth)

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
  };
}


// Métricas y Estadísticas

export interface ProjectStats {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  overdue: number;
  archived: number;
  deleted: number;
}

// Error

export interface ApiError {
  error: string;
}
