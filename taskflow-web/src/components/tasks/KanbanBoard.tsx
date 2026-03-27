'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: number, newStatus: TaskStatus) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onArchive?: (task: Task) => void;
}

/** Tablero Kanban para gestión visual de tareas con drag-and-drop */
export default function KanbanBoard({ tasks, onTaskMove, onEdit, onDelete, onArchive }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: 'Por hacer' },
    { id: 'in_progress', title: 'En progreso' },
    { id: 'done', title: 'Completadas' },
  ];

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  }


  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as number;
    const overId = over.id as string;

    let newStatus: TaskStatus | null = null;
    
    if (['todo', 'in_progress', 'done'].includes(overId)) {
      newStatus = overId as TaskStatus;
    } else {
      const targetTask = tasks.find((t) => t.id === over.id);
      if (targetTask) newStatus = targetTask.status;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (task && newStatus && task.status !== newStatus) {
      await onTaskMove(taskId, newStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start min-h-[600px] animate-fade-in">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={tasks.filter((t) => t.status === col.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: { active: { opacity: '0.4' } },
        }),
      }}>
        {activeTask ? (
          <div className="rotate-3 scale-105 opacity-90 shadow-2xl cursor-grabbing pointer-events-none">
            <TaskCard 
              task={activeTask} 
              onEdit={() => {}} 
              onDelete={() => {}} 
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
