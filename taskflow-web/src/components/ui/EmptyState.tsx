'use client';

import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

/** Estado vacío con icono y mensaje descriptivo */
export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 lg:p-24 animate-fade-in group w-full">
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full scale-150 blur-2xl group-hover:scale-175 transition-transform duration-1000" />
        <div className="relative p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/5 group-hover:rotate-12 transition-transform duration-700">
          {icon || (
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" /><path d="M15 21l2-2 4 4" /><path d="M19 15l2 2-4 4" /><path d="M12 7h5" /><path d="M12 11h3" /><path d="M7 7h1" /><path d="M7 11h1" />
            </svg>
          )}
        </div>
      </div>

      <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter mb-4 max-w-md">
        {title}
      </h3>
      
      {description && (
        <p className="text-lg text-slate-400 dark:text-slate-600 font-medium max-w-lg mb-12 leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <div className="transform hover:scale-105 active:scale-95 transition-all">
          {action}
        </div>
      )}
    </div>
  );
}
