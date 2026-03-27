import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string | number }[];
  id: string;
}

/**
 * Selector estilizado compatible con temas dinámicos.
 */
export default function Select({ label, options, id, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-2 group w-full">
      {label && (
        <label htmlFor={id} className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] pl-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={[
            'w-full min-w-[140px] appearance-none bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-2xl pl-6 pr-12 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all outline-none',
            'focus:border-indigo-500/50 dark:focus:border-indigo-400/50 focus:ring-8 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/10 hover:shadow-md dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
            className,
          ].join(' ')}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-600">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
