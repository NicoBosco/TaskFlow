import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
}

/** Campo de entrada con estados de validación y foco adaptativo */
export default function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2 group w-full">
      {label && (
        <label htmlFor={id} className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] pl-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'w-full bg-white dark:bg-slate-900/50 border rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all outline-none',
          error 
            ? 'border-rose-400 ring-4 ring-rose-50 dark:ring-rose-900/10' 
            : 'border-slate-100 dark:border-white/5 focus:border-indigo-500/50 dark:focus:border-indigo-400/50 focus:ring-8 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/10',
          'placeholder:text-slate-400 dark:placeholder:text-slate-600',
          className,
        ].join(' ')}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-bold text-rose-500 dark:text-rose-400 mt-1 pl-1 uppercase tracking-wider">
          {error}
        </p>
      )}
    </div>
  );
}
