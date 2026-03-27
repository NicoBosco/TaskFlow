'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types';
import SortableTaskCard from './SortableTaskCard';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onArchive?: (task: Task) => void;
}

/**
 * Columna individual del tablero Kanban.
 * Soporta soltar elementos (droppable) y contiene una lista ordenable.
 */
export default function KanbanColumn({ id, title, tasks, onEdit, onDelete, onArchive }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col gap-6 p-6 rounded-[2.5rem] border transition-all duration-300 min-h-[400px] ${
        isOver 
          ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-500/30 scale-[1.01]' 
          : 'bg-slate-50/30 dark:bg-slate-900/20 border-slate-100 dark:border-white/5'
      }`}
    >
      {/* Cabecera de Columna */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">
          {title}
        </h3>
        <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-[10px] font-black text-indigo-600 dark:text-indigo-400 shadow-sm">
          {tasks.length}
        </span>
      </div>

      {/* Lista de Tareas Ordenables */}
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-5">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onArchive={onArchive}
            />
          ))}
          
          {/* Indicador visual de columna vacía durante el arrastre */}
          {tasks.length === 0 && (
            <div className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] h-24 flex items-center justify-center text-xs text-slate-300 dark:text-slate-700 font-bold uppercase tracking-widest leading-none">
              Soltar aquí
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
