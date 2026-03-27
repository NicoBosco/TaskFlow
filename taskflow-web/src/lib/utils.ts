import { TaskStatus, TaskPriority, DueUrgency } from '@/types';
/** Formatea fecha a representación legible (es-AR) */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Calcula nivel de urgencia según fecha de vencimiento */
export function getDueUrgency(dueDate: string | null, status: TaskStatus = 'todo'): DueUrgency {
  // Si no hay fecha o la tarea ya está terminada, la urgencia es nula.
  if (!dueDate || status === 'done') return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Normalizamos la fecha de entrada para comparar solo días
  const due = new Date(dueDate.substring(0, 10) + 'T00:00:00'); 
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';        
  if (diffDays === 0) return 'due_today';     
  if (diffDays <= 3) return 'due_soon';       
  if (diffDays <= 7) return 'due_this_week';  
  
  return 'due_later';                         
}

/** Obtiene etiqueta descriptiva de urgencia */
export function getDueUrgencyLabel(urgency: DueUrgency): string {
  if (!urgency) return '';
  const labels: Record<NonNullable<DueUrgency>, string> = {
    overdue: 'Vencida',
    due_today: 'Vence hoy',
    due_soon: 'Próxima',
    due_this_week: 'En breve',
    due_later: 'A largo plazo',
  };
  return labels[urgency];
}

/** Retorna clases Tailwind según urgencia */
export function getDueUrgencyClass(urgency: DueUrgency): string {
  if (!urgency) return '';
  const classes: Record<NonNullable<DueUrgency>, string> = {
    overdue: 'bg-rose-50 text-rose-700 border-rose-100',
    due_today: 'bg-amber-50 text-amber-700 border-amber-100',
    due_soon: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    due_this_week: 'bg-slate-50 text-slate-700 border-slate-100',
    due_later: 'bg-slate-50/50 text-slate-400 border-slate-100/50',
  };
  return classes[urgency];
}

/** Retorna clases Tailwind según estado */
export function getStatusClasses(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    todo: 'bg-slate-100 text-slate-600',
    in_progress: 'bg-blue-50 text-blue-700',
    done: 'bg-emerald-50 text-emerald-700',
  };
  return map[status];
}

/** Retorna clases Tailwind según prioridad */
export function getPriorityClasses(priority: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    low: 'bg-slate-100 text-slate-500',
    medium: 'bg-amber-50 text-amber-700',
    high: 'bg-red-50 text-red-700',
  };
  return map[priority];
}

/** Obtiene color del indicador visual de prioridad */
export function getPriorityDotClass(priority: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    low: 'bg-slate-400',
    medium: 'bg-amber-500',
    high: 'bg-red-500',
  };
  return map[priority];
}

/** Trunca texto con puntos suspensivos */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
