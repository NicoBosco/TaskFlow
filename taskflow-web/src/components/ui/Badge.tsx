import { TaskStatus, TaskPriority } from '@/types';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/constants';
import { getStatusClasses, getPriorityClasses, getPriorityDotClass } from '@/lib/utils';

interface StatusBadgeProps {
  status: TaskStatus;
}

interface PriorityBadgeProps {
  priority: TaskPriority;
}

/**
 * Etiqueta de estado con variantes de color.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm',
        getStatusClasses(status),
      ].join(' ')}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Badge de prioridad con indicador visual dinámico.
 */
export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm',
        getPriorityClasses(priority),
      ].join(' ')}
    >
      <span
        className={['w-2.5 h-2.5 rounded-full ring-4 ring-white/10 dark:ring-black/10 shadow-lg', getPriorityDotClass(priority)].join(' ')}
        aria-hidden="true"
      />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
