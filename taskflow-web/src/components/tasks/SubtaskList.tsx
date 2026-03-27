'use client';

import React, { useState, useEffect } from 'react';
import { Subtask } from '@/types';
import { subtasksApi } from '@/lib/api';

interface SubtaskListProps {
  taskId: number;
}

export default function SubtaskList({ taskId }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    subtasksApi.getByTask(taskId).then(setSubtasks);
  }, [taskId]);

  const handleToggle = async (subtask: Subtask) => {
    try {
      const updated = await subtasksApi.update(subtask.id, { is_completed: !subtask.is_completed });
      setSubtasks(subtasks.map(s => s.id === subtask.id ? updated! : s));
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || loading) return;

    setLoading(true);
    try {
      const created = await subtasksApi.create(taskId, newTitle.trim());
      setSubtasks([...subtasks, created]);
      setNewTitle('');
    } catch (error) {
      console.error('Error adding subtask:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await subtasksApi.delete(id);
      setSubtasks(subtasks.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
          Checklist
        </h4>
        <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
          {subtasks.filter(s => s.is_completed).length}/{subtasks.length}
        </div>
      </div>

      <div className="space-y-2">
        {subtasks.map((st) => (
          <div 
            key={st.id} 
            className="group flex items-center gap-4 p-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 transition-all"
          >
            <button
              onClick={() => handleToggle(st)}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                st.is_completed 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {st.is_completed && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <span className={`text-sm font-medium flex-1 transition-all ${
              st.is_completed ? 'text-slate-400 line-through opacity-50' : 'text-slate-700 dark:text-slate-300'
            }`}>
              {st.title}
            </span>
            <button
              onClick={() => handleDelete(st.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        ))}

        <form onSubmit={handleAdd} className="mt-4">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nuevo paso..."
            className="w-full p-4 text-sm bg-transparent border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
          />
        </form>
      </div>
    </div>
  );
}
