'use client';

import { useState } from 'react';
import { CreateTaskPayload, Task, TaskStatus, TaskPriority } from '@/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface TaskFormProps {
  initial?: Task;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
  onCancel: () => void;
}

/** Formulario de tareas con gestión de etiquetas y estados */
export default function TaskForm({ initial, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status || 'todo');
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initial?.due_date ? initial.due_date.substring(0, 10) : '');
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        due_date: dueDate || null,
        tags,
      });
    } finally {
      setLoading(false);
    }
  }

  function addTag() {
    const val = tagInput.trim().toLowerCase();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setTagInput('');
    }
  }

  function removeTag(t: string) {
    setTags(tags.filter(tg => tg !== t));
  }

  return (
    <form onSubmit={handleSubmit} className="p-10 lg:p-14 space-y-12 bg-white dark:bg-slate-950 transition-colors">
      
      <div className="space-y-4">
        <Input
          id="task-title"
          label="Título de la tarea"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la tarea..."
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Select
          id="task-status"
          label="Estado Actual"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          options={[
            { label: 'Por hacer', value: 'todo' },
            { label: 'En progreso', value: 'in_progress' },
            { label: 'Completada', value: 'done' },
          ]}
        />
        <Select
          id="task-priority"
          label="Nivel de Prioridad"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          options={[
            { label: 'Baja', value: 'low' },
            { label: 'Media', value: 'medium' },
            { label: 'Alta', value: 'high' },
          ]}
        />
        <Input
          id="task-due"
          label="Fecha Límite"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 group">
        <label htmlFor="task-desc" className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] pl-1">
          Detalles y Notas
        </label>
        <textarea
          id="task-desc"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Añadí más contexto para tu equipo..."
          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-[2rem] px-8 py-6 text-base font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-8 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/10 focus:border-indigo-200 dark:focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-700 shadow-inner"
        />
      </div>

      <div className="space-y-4">
        <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] pl-1">Etiquetas del Proyecto</div>
        <div className="flex flex-wrap gap-2.5 min-h-[50px] p-2 rounded-2xl border border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-white/5">
          {tags.map(t => (
            <span key={t} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105">
              #{t}
              <button type="button" onClick={() => removeTag(t)} className="hover:text-rose-200 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="Presioná enter para añadir tag..."
            className="flex-1 min-w-[200px] bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700 px-4"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t border-slate-50 dark:border-white/5">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel} 
          className="flex-1 py-5 rounded-[1.5rem]"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          loading={loading} 
          className="flex-1 py-5 rounded-[1.5rem] shadow-2xl"
        >
          {initial ? 'Actualizar Tarea' : 'Crear Tarea'}
        </Button>
      </div>
    </form>
  );
}
