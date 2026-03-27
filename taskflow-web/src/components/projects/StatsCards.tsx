import { ProjectStats } from '@/types';

interface StatsCardsProps {
  stats: ProjectStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { label: 'Total', value: stats.total, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/30 dark:bg-indigo-900/10' },
    { label: 'Por hacer', value: stats.todo, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50/50 dark:bg-slate-800/30' },
    { label: 'En proceso', value: stats.in_progress, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/30 dark:bg-blue-900/10' },
    { label: 'Completadas', value: stats.done, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/30 dark:bg-emerald-900/10' },
    { label: 'Vencidas', value: stats.overdue, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/30 dark:bg-rose-900/10' },
    { label: 'Archivadas', value: stats.archived || 0, color: 'text-slate-400 dark:text-slate-500', bg: 'bg-slate-50/20 dark:bg-slate-900/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 mb-20 animate-fade-in">
      {cards.map(({ label, value, color, bg }) => (
        <div key={label} className={`p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 ${bg} backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl`}>
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-4">{label}</div>
          <div className={`text-5xl font-black tracking-tight ${color}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}
