'use client';

import { Task } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { getDueUrgency, getDueUrgencyLabel, getDueUrgencyClass } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import SubtaskList from './SubtaskList';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onArchive?: (task: Task) => void;
  onRestore?: (task: Task) => void;
  showArchived?: boolean;
  showDeleted?: boolean;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  showArchived,
  showDeleted,
}: TaskCardProps) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  
  const urgency = getDueUrgency(task.due_date);
  const urgencyLabel = getDueUrgencyLabel(urgency);
  const urgencyClass = getDueUrgencyClass(urgency);

  return (
    <div className="group relative bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/[0.03] rounded-[2.5rem] p-8 lg:p-12 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_40px_80px_rgba(0,0,0,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">
      
      {/* Indicador visual de prioridad */}
      <div className={`absolute left-0 top-0 bottom-0 w-2.5 opacity-90 transition-all group-hover:w-4 ${
        task.priority === 'high' ? 'bg-gradient-to-b from-rose-500 to-rose-600' : task.priority === 'medium' ? 'bg-gradient-to-b from-amber-400 to-amber-500' : 'bg-gradient-to-b from-emerald-400 to-emerald-500'
      }`} />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
        
        {/* Contenido Principal */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {task.title}
            </h3>
            {urgency && (
              <span className={`text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border-2 ${urgencyClass} dark:opacity-80`}>
                {urgencyLabel}
              </span>
            )}
          </div>
          
          {task.description && (
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed line-clamp-2 font-medium">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-5 pt-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            
            {task.due_date && (
              <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-[0.15em] pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {format(new Date(task.due_date), "d 'de' MMMM", { locale: es })}
              </div>
            )}

            {task.tags.length > 0 && (
              <div className="flex gap-2.5 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                {task.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-black text-indigo-500/90 dark:text-indigo-400/80 bg-indigo-50/50 dark:bg-indigo-900/20 px-3 py-1 rounded-xl border border-indigo-100/30 dark:border-indigo-500/10">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Acciones de gestión */}
        <div className="flex items-center gap-4 lg:pl-12 lg:border-l-2 lg:border-slate-50 dark:lg:border-slate-800">
          {!showArchived && !showDeleted && (
            <>
              <button
                onClick={() => onEdit(task)}
                className="p-4 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all active:scale-90"
                title="Editar"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              
              {onArchive && (
                <button
                  onClick={() => onArchive(task)}
                  className="p-4 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-2xl transition-all active:scale-90"
                  title="Archivar"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
                  </svg>
                </button>
              )}
            </>
          )}

          {onRestore && (showArchived || showDeleted) && (
            <button
              onClick={() => onRestore(task)}
              className="px-6 py-4 text-sm font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all active:scale-95 flex items-center gap-2.5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
              Reactivar
            </button>
          )}

          <button
            onClick={() => onDelete(task)}
            className="p-4 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-2xl transition-all active:scale-90"
            title="Eliminar"
          >
           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Checklist Expandible */}
      {showSubtasks && (
        <div className="px-10 pb-10 animate-slide-down">
          <div className="pt-8 border-t border-slate-50 dark:border-white/5">
            <SubtaskList taskId={task.id} />
          </div>
        </div>
      )}

      {/* Botón de Expansión para Subtareas */}
      <button 
        onClick={(e) => { e.stopPropagation(); setShowSubtasks(!showSubtasks); }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">
          {showSubtasks ? 'Contraer' : 'Subtareas'}
        </span>
        <svg 
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"
          className={`transition-transform duration-500 ${showSubtasks ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
}
