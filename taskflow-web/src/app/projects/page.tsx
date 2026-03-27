'use client';

import { useEffect, useState, useCallback } from 'react';
import { Project } from '@/types';
import { projectsApi } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectForm from '@/components/projects/ProjectForm';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

type ViewMode = 'active' | 'archived' | 'deleted';

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = (searchParams.get('view') as ViewMode) || 'active';
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null);

  const fetchProjects = useCallback(async (v: ViewMode) => {
    try {
      setLoading(true);
      const data = await projectsApi.getAll({ archived: v === 'archived', deleted: v === 'deleted' });
      setProjects(data);
    } catch {
      console.error('Error al sincronizar proyectos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(view); }, [view, fetchProjects]);

  return (
    <div className="animate-fade-in space-y-16">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-slate-50 dark:border-white/5 pb-16">
        <div className="space-y-6">
          <div className="inline-flex px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
            Proyectos
          </div>
          <h1 className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.8]">Proyectos</h1>
          <p className="text-2xl text-slate-400 dark:text-slate-600 font-medium max-w-2xl leading-relaxed">
            Administra tus proyectos y tareas con una visión clara de tu progreso.
          </p>
        </div>

        <button
          onClick={() => { setSelectedProject(null); setModalOpen(true); }}
          className="px-10 py-5 bg-indigo-600 text-white font-black rounded-[2rem] text-xl shadow-2xl shadow-indigo-600/30 hover:-translate-y-2 transition-all active:scale-95"
        >
          Crear Proyecto
        </button>
      </div>

      <div className="flex items-center gap-8">
        {(['active', 'archived', 'deleted'] as const).map((v) => (
          <button
            key={v}
            onClick={() => router.push(`/projects?view=${v}`)}
            className={`text-sm font-black uppercase tracking-[0.3em] transition-all pb-2 border-b-4 ${
              view === v 
              ? 'border-indigo-600 text-slate-900 dark:text-white' 
              : 'border-transparent text-slate-300 dark:text-slate-700 hover:text-slate-600 dark:hover:text-slate-500'
            }`}
          >
            {v === 'active' ? 'En Curso' : v === 'archived' ? 'Archivados' : 'Papelera'}
          </button>
        ))}
      </div>

      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-slate-50 dark:bg-slate-900/30 rounded-[3rem] animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-40 bg-slate-50/50 dark:bg-slate-900/20 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5">
            <EmptyState 
              title={view === 'active' ? 'Empieza aquí' : 'Sección vacía'}
              description={view === 'active' ? 'Crea tu primer proyecto para empezar a organizar tus tareas.' : 'No hay proyectos en esta sección.'}
              action={view === 'active' ? <Button onClick={() => setModalOpen(true)}>Crear Proyecto</Button> : undefined}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {projects.map(p => (
              <ProjectCard 
                key={p.id} project={p}
                onEdit={(proj) => { setSelectedProject(proj); setModalOpen(true); }}
                onDelete={setDeleteConfirm}
                onArchive={(proj) => projectsApi.archive(proj.id).then(() => fetchProjects(view))}
                onUnarchive={(proj) => projectsApi.unarchive(proj.id).then(() => fetchProjects(view))}
                onRestore={(proj) => projectsApi.restore(proj.id).then(() => fetchProjects(view))}
              />
            ))}
          </div>
        )}
      </section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}>
        <ProjectForm
          initial={selectedProject ?? undefined}
          onSubmit={async (p) => {
            if (selectedProject) await projectsApi.update(selectedProject.id, p);
            else await projectsApi.create(p);
            setModalOpen(false); fetchProjects(view);
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Acción" maxWidth="sm">
        <div className="p-12 space-y-10">
          <p className="text-xl text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
            ¿Confirmas la eliminación de <span className="text-slate-900 dark:text-white font-black">{deleteConfirm?.name}</span>?
            {view !== 'deleted' ? ' Se moverá a la papelera.' : ' Esta acción no se puede deshacer.'}
          </p>
          <div className="flex gap-4">
            <Button variant="ghost" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={async () => {
              if (deleteConfirm) {
                if (view === 'deleted') await projectsApi.permanentDelete(deleteConfirm.id);
                else await projectsApi.delete(deleteConfirm.id);
                setDeleteConfirm(null); fetchProjects(view);
              }
            }}>Confirmar</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
