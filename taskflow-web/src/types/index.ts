export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  due_date: string | null;
  archived_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  total_tasks?: number;
  completed_tasks?: number;
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
  due_date: string | null;
  tags: string[];
  archived_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: number;
  task_id: number;
  title: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

// Estado derivado de due_date (solo UI)
export type DueUrgency = 'overdue' | 'due_today' | 'due_soon' | 'due_this_week' | 'due_later' | null;


export interface CreateProjectPayload {
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  due_date?: string | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  tags?: string[];
}

export type DueFilter = 'overdue' | 'next3' | 'next7' | 'long' | 'none' | '';

export interface TaskFilters {
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  search?: string;
  overdue?: boolean;
  due_filter?: DueFilter;
  archived?: boolean;
  deleted?: boolean;
}


export interface ProjectStats {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  overdue: number;
  archived: number;
  deleted: number;
}


export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
