'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import TaskCard from './TaskCard';

interface SortableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onArchive?: (task: Task) => void;
  onRestore?: (task: Task) => void;
}

/**
 * Wrapper de TaskCard que inyecta la lógica de Sortable de dnd-kit.
 * Permite que cada tarjeta sea arrastrable y ordene automáticamente la lista.
 */
export default function SortableTaskCard(props: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative cursor-grab active:cursor-grabbing transition-transform touch-none ${
        isDragging ? 'z-50' : ''
      }`}
    >
      <TaskCard {...props} />
    </div>
  );
}
