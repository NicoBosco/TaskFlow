import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * Botón base con variantes de diseño y estados de carga.
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/40 dark:shadow-indigo-600/10',
  secondary:
    'bg-slate-900 dark:bg-slate-800 text-white border border-slate-800 dark:border-slate-700 hover:bg-slate-800 dark:hover:bg-slate-700',
  danger:
    'bg-rose-600 text-white shadow-xl shadow-rose-600/20 hover:bg-rose-700 dark:shadow-rose-600/10',
  ghost:
    'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100',
  outline:
    'bg-transparent text-slate-700 dark:text-slate-300 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-400',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl',
  md: 'px-8 py-3.5 text-sm font-black rounded-2xl',
  lg: 'px-10 py-5 text-lg font-black rounded-3xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 mr-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
}
