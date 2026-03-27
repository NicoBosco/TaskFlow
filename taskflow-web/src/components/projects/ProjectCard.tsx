import Link from 'next/link';
import { Project } from '@/types';
import { PROJECT_STATUS_LABELS, PROJECT_PRIORITY_LABELS } from '@/constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onArchive: (project: Project) => void;
  onUnarchive?: (project: Project) => void;
  onRestore?: (project: Project) => void;
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onRestore,
}: ProjectCardProps) {
  
  const priorityColor = project.priority === 'high' ? 'text-rose-600 dark:text-rose-400' : project.priority === 'medium' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';
  const priorityBg = project.priority === 'high' ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20' : project.priority === 'medium' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20';

  return (
    <div className="group relative bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/[0.03] rounded-[3rem] p-8 lg:p-12 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:shadow-[0_50px_100px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_50px_100px_rgba(0,0,0,0.4)] hover:-translate-y-3 transition-all duration-700 overflow-hidden">
      
      <div className={`absolute top-0 right-0 px-8 py-3 rounded-bl-[2.5rem] text-[10px] font-black uppercase tracking-[0.25em] ${
        project.status === 'finished' ? 'bg-emerald-600 text-white' : project.status === 'paused' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
      } shadow-lg`}>
        {PROJECT_STATUS_LABELS[project.status]}
      </div>

      <div className="flex flex-col gap-10">
        <div className="space-y-4">
          <Link href={`/projects/${project.id}`}>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {project.name}
            </h3>
          </Link>
          <p className="text-lg text-slate-400 dark:text-slate-500 font-medium line-clamp-2 max-w-sm">
            {project.description || 'Sin descripción detallada.'}
          </p>
        </div>

        {project.total_tasks !== undefined && project.total_tasks > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                Progreso del Proyecto
              </span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {Math.round((project.completed_tasks! / project.total_tasks!) * 100)}%
              </span>
            </div>
            <div className="h-3 w-full bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                style={{ width: `${(project.completed_tasks! / project.total_tasks!) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
              <span>{project.completed_tasks} completadas</span>
              <span>{project.total_tasks} totales</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${priorityBg} ${priorityColor}`}>
            Prioridad {PROJECT_PRIORITY_LABELS[project.priority]}
          </span>
          
          {project.due_date && (
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest pl-4 border-l border-slate-100 dark:border-slate-800">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {format(new Date(project.due_date), "d 'de' MMMM", { locale: es })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-white/5">
          <Link
            href={`/projects/${project.id}`}
            className="flex items-center gap-3 text-sm font-black text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform"
          >
            Ver Tablero
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <div className="flex items-center gap-2">
            {!project.deleted_at && !project.archived_at && (
              <>
                <button
                  onClick={() => onEdit(project)}
                  className="p-3 text-slate-400 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Editar"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                {onArchive && (
                  <button
                    onClick={() => onArchive(project)}
                    className="p-3 text-slate-400 dark:text-slate-600 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                    title="Archivar"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>
                  </button>
                )}
              </>
            )}

            {onUnarchive && project.archived_at && (
              <button
                onClick={() => onUnarchive(project)}
                className="px-4 py-2 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all uppercase tracking-widest"
              >
                Reactivar
              </button>
            )}

            {onRestore && project.deleted_at && (
              <button
                onClick={() => onRestore(project)}
                className="px-4 py-2 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all uppercase tracking-widest"
              >
                Reactivar
              </button>
            )}

            <button
              onClick={() => onDelete(project)}
              className="p-3 text-slate-400 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Eliminar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
