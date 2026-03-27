'use client';

import { TaskFilters as FilterType, TaskStatus, TaskPriority, DueFilter } from '@/types';
import Select from '@/components/ui/Select';

interface TaskFiltersProps {
  filters: FilterType;
  onChange: (filters: Partial<FilterType>) => void;
  view: 'active' | 'archived' | 'deleted';
  onViewChange: (view: 'active' | 'archived' | 'deleted') => void;
}

/** Componente de filtrado y búsqueda de tareas */
export default function TaskFiltersBar({
  filters,
  onChange,
  view,
  onViewChange,
}: TaskFiltersProps) {
  const hasFilters = !!(filters.status || filters.priority || filters.search || filters.due_filter);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 p-1">
      
      <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
        
        <div className="relative group flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por título o etiquetas..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-[1.5rem] 
                       text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-8 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/10 
                       focus:border-indigo-200 dark:focus:border-indigo-500/50 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-4">
          <Select
            id="filter-status"
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as TaskStatus | '' })}
            options={[
              { label: 'Todos los estados', value: '' },
              { label: 'Por hacer', value: 'todo' },
              { label: 'En progreso', value: 'in_progress' },
              { label: 'Completado', value: 'done' },
            ]}
            className="min-w-[180px] shadow-sm"
          />
          <Select
            id="filter-priority"
            value={filters.priority}
            onChange={(e) => onChange({ ...filters, priority: e.target.value as TaskPriority | '' })}
            options={[
              { label: 'Prioridad (Todas)', value: '' },
              { label: 'Alta', value: 'high' },
              { label: 'Media', value: 'medium' },
              { label: 'Baja', value: 'low' },
            ]}
            className="min-w-[170px] shadow-sm"
          />
          <Select
            id="filter-due"
            value={filters.due_filter || ''}
            onChange={(e) => onChange({ ...filters, due_filter: e.target.value as DueFilter })}
            options={[
              { label: 'Vencimiento (Cualquiera)', value: '' },
              { label: 'Vencidas', value: 'overdue' },
              { label: 'Próximas (3 días)', value: 'next3' },
              { label: 'Próximas (7 días)', value: 'next7' },
              { label: 'Largo plazo (> 7 días)', value: 'long' },
              { label: 'Sin fecha establecida', value: 'none' },
            ]}
            className="min-w-[220px] shadow-sm"
          />
        </div>

        {hasFilters && (
          <button
            onClick={() => onChange({ status: '', priority: '', search: '', due_filter: '' })}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all uppercase tracking-widest"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      <div className="flex bg-slate-100/50 dark:bg-slate-900 p-1.5 rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-inner gap-1">
        {(['active', 'archived', 'deleted'] as const).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.25rem] transition-all duration-300
                        ${view === v 
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-100/30 dark:shadow-black/50 translate-y-[-1px]' 
                          : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
          >
            {v === 'active' ? 'Activas' : v === 'archived' ? 'Archivadas' : 'Papelera'}
          </button>
        ))}
      </div>
    </div>
  );
}
