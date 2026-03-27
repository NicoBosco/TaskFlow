'use client';

import { useState } from 'react';
import { Project, CreateProjectPayload, ProjectStatus, ProjectPriority } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ProjectFormProps {
  initial?: Project;
  onSubmit: (payload: CreateProjectPayload) => Promise<void>;
  onCancel: () => void;
}

/** Formulario de creación y edición de proyectos */
export default function ProjectForm({ initial, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'active');
  const [priority, setPriority] = useState<ProjectPriority>(initial?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit({ 
        name: name.trim(), 
        description: description.trim() || undefined,
        status,
        priority,
        due_date: dueDate || null
      });
    } catch (err: unknown) {
      console.error('[PROJECT_CREATE_ERROR]', err);
      const message = err instanceof Error ? err.message : 'Error al procesar la solicitud.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-10 lg:p-14 space-y-12 bg-white dark:bg-slate-950 transition-colors">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Input
          id="project-name"
          label="Nombre del proyecto"
          placeholder="Ej: Lanzamiento Q4..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          required
          autoFocus
        />
        <Input
          id="project-due"
          label="Fecha de Vencimiento"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] pl-1">
            Estado Actual
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-8 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/10 transition-all cursor-pointer"
          >
            <option value="active">En curso</option>
            <option value="paused">Pausado</option>
            <option value="finished">Finalizado</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] pl-1">
            Nivel de Prioridad
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as ProjectPriority)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-8 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/10 transition-all cursor-pointer"
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2 group">
        <label htmlFor="project-desc" className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] pl-1">
          Descripción del proyecto
        </label>
        <textarea
          id="project-desc"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="¿Cuál es el propósito de este proyecto?..."
          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-[2rem] px-8 py-6 text-base font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-8 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/10 focus:border-indigo-200 dark:focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-700 shadow-inner"
        />
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
          {initial ? 'Actualizar Proyecto' : 'Crear Proyecto'}
        </Button>
      </div>
    </form>
  );
}
