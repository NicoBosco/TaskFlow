'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Project, Task, TaskFilters, ProjectStats, TaskStatus } from '@/types';
import { projectsApi, tasksApi } from '@/lib/api';
import TaskCard from '@/components/tasks/TaskCard';
import TaskForm from '@/components/tasks/TaskForm';
import TaskFiltersBar from '@/components/tasks/TaskFilters';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import StatsCards from '@/components/projects/StatsCards';
import Pagination from '@/components/ui/Pagination';
const TASKS_PER_PAGE = 8;

type ViewMode = 'active' | 'archived' | 'deleted';


export default function ProjectTasksPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id, 10);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<ViewMode>('active');
  const [filters, setFilters] = useState<TaskFilters>({ status: '', priority: '', search: '' });
  const [viewType, setViewType] = useState<'list' | 'kanban'>('kanban');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Task | null>(null);

  const fetchTasks = useCallback(async (f: TaskFilters, v: ViewMode) => {
    try {
      const data = await tasksApi.getByProject(projectId, { ...f, archived: v === 'archived', deleted: v === 'deleted' });
      setTasks(data);
      setPage(1);
    } catch { setError('Error al cargar datos'); }
  }, [projectId]);

  useEffect(() => {
    async function init() {
      try {
        const [p, t, s] = await Promise.all([projectsApi.getById(projectId), tasksApi.getByProject(projectId, {}), tasksApi.getStats(projectId)]);
        setProject(p); setTasks(t); setStats(s);
      } catch { setError('Proyecto inexistente o sin acceso'); }
      finally { setLoading(false); }
    }
    init();
  }, [projectId]);

  useEffect(() => { if (!loading) fetchTasks(filters, view); }, [view, filters, fetchTasks, loading]);

  const pagedTasks = tasks.slice((page - 1) * TASKS_PER_PAGE, page * TASKS_PER_PAGE);
  const hasFilters = !!(filters.status || filters.priority || filters.search);

  // Funciones auxiliares para TaskCard y KanbanBoard
  const onArchive = useCallback(async (task: Task) => {
    await tasksApi.archive(task.id);
    fetchTasks(filters, view);
    tasksApi.getStats(projectId).then(setStats);
  }, [fetchTasks, filters, view, projectId]);

  const onUnarchive = useCallback(async (task: Task) => {
    await tasksApi.unarchive(task.id);
    fetchTasks(filters, view);
    tasksApi.getStats(projectId).then(setStats);
  }, [fetchTasks, filters, view, projectId]);

  const onRestore = useCallback(async (task: Task) => {
    await tasksApi.restore(task.id);
    fetchTasks(filters, view);
    tasksApi.getStats(projectId).then(setStats);
  }, [fetchTasks, filters, view, projectId]);

  const handleTaskMove = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await tasksApi.update(taskId, { status: newStatus });
      fetchTasks(filters, view);
      tasksApi.getStats(projectId).then(setStats);
    } catch {
      // Revertir visualmente si falla (sería mejor con optimismo, pero fetchTasks refresca)
    }
  };

  if (loading) return <div className="py-20 text-center animate-pulse text-slate-300 font-bold uppercase tracking-widest">Cargando tareas...</div>;
  if (error) return <div className="py-20 text-center text-rose-500 font-black">{error}</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-slate-50 dark:border-white/5 pb-16">
        <div className="space-y-6">
          <div className="inline-flex px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
            Tablero de Tareas
          </div>
          
          <div className="flex items-center gap-6 flex-wrap">
            {project?.name && /^\p{Emoji}/u.test(project.name) ? (
              <>
                <span className="text-8xl filter drop-shadow-2xl">{project.name.match(/^\p{Emoji}/u)?.[0]}</span>
                <h1 className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                  {project.name.replace(/^\p{Emoji}\s*/u, '')}
                </h1>
              </>
            ) : (
              <h1 className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                {project?.name || 'Cargando...'}
              </h1>
            )}
          </div>
          
          <p className="text-2xl text-slate-400 dark:text-slate-600 font-medium max-w-2xl leading-relaxed">
            {project?.description || 'Gestiona las tareas y el progreso de este proyecto.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex bg-slate-50 dark:bg-slate-900/50 p-2 rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-inner">
            <button
              onClick={() => setViewType('list')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                viewType === 'list' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-400'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewType('kanban')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                viewType === 'kanban' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-400'
              }`}
            >
              Kanban
            </button>
          </div>

          {view === 'active' && (
            <button
              onClick={() => { setSelectedTask(null); setModalOpen(true); }}
              className="px-10 py-5 bg-indigo-600 text-white font-black rounded-3xl text-xl shadow-2xl shadow-indigo-600/30 hover:-translate-y-2 transition-all active:scale-95"
            >
              Nueva Tarea
            </button>
          )}
        </div>
      </div>

      {stats && <StatsCards stats={stats} />}

      <div className="mb-12">
        <TaskFiltersBar filters={filters} onChange={setFilters} view={view} onViewChange={setView} />
      </div>

      <section className="animate-fade-in">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-50 dark:bg-slate-900/30 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/5">
            <EmptyState
              title={hasFilters ? 'Sin coincidencias' : 'Sin tareas'}
              description={hasFilters ? 'Ninguna tarea coincide con los filtros activos.' : 'Este proyecto no tiene tareas aún.'}
              action={!hasFilters ? <Button onClick={() => setModalOpen(true)}>Crear primera tarea</Button> : undefined}
            />
          </div>
        ) : viewType === 'kanban' && view === 'active' ? (
          <KanbanBoard
            tasks={tasks}
            onTaskMove={handleTaskMove}
            onEdit={(t) => { setSelectedTask(t); setModalOpen(true); }}
            onDelete={setDeleteConfirm}
            onArchive={onArchive}
          />
        ) : (
          <div className="space-y-8">
            {pagedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => { setSelectedTask(t); setModalOpen(true); }}
                onDelete={setDeleteConfirm}
                onArchive={view === 'active' ? onArchive : undefined}
                onRestore={view === 'archived' ? onUnarchive : view === 'deleted' ? onRestore : undefined}
                showArchived={view === 'archived'} showDeleted={view === 'deleted'}
              />
            ))}
          </div>
        )}
      </section>

      {viewType === 'list' && <Pagination total={tasks.length} page={page} perPage={TASKS_PER_PAGE} onPageChange={setPage} />}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedTask ? 'Editar Tarea' : 'Nueva Tarea'}>
        <TaskForm
          initial={selectedTask ?? undefined}
          onSubmit={async (p) => {
            if (selectedTask) await tasksApi.update(selectedTask.id, p);
            else await tasksApi.create(projectId, p);
            setModalOpen(false);
            fetchTasks(filters, view);
            tasksApi.getStats(projectId).then(setStats);
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Acción" maxWidth="sm">
        <div className="p-10 space-y-10">
          <p className="text-xl text-slate-500 font-bold leading-relaxed transition-colors dark:text-slate-400">
            ¿Deseas eliminar {view === 'deleted' ? 'permanentemente ' : ''}la tarea <span className="text-slate-900 dark:text-slate-100 font-black">{deleteConfirm?.title}</span>?
            {view !== 'deleted' && <span className="block mt-2 text-sm text-slate-400">La misma será movida a la Papelera.</span>}
          </p>
          <div className="flex gap-4">
            <Button variant="ghost" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={async () => {
              if (deleteConfirm) {
                if (view === 'deleted') await tasksApi.permanentDelete(deleteConfirm.id);
                else await tasksApi.delete(deleteConfirm.id);
                setDeleteConfirm(null); fetchTasks(filters, view); tasksApi.getStats(projectId).then(setStats);
              }
            }}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
