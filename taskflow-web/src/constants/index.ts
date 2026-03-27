import { 
  ProjectStatus, 
  ProjectPriority, 
  TaskStatus, 
  TaskPriority, 
  DueUrgency 
} from '@/types';


export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'En curso',
  paused: 'Pausado',
  finished: 'Finalizado',
};

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  done: 'Completada',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

export const DUE_URGENCY_LABELS: Record<NonNullable<DueUrgency>, string> = {
  overdue: 'Vencida',
  due_today: 'Vence hoy',
  due_soon: 'Próxima',
  due_this_week: 'En breve',
  due_later: 'A largo plazo',
};
