'use client';

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

/** Componente Modal con transiciones y backdrop de desenfoque */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = '2xl' 
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-xl transition-opacity duration-500" 
        onClick={onClose} 
      />
      
      <div 
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-slate-950 rounded-[3rem] shadow-2xl dark:shadow-black/50 border border-slate-100 dark:border-white/5 overflow-hidden transition-all duration-500 scale-100`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-white/5">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-3 text-slate-400 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all active:scale-90"
            aria-label="Cerrar modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
          {children}
        </div>
      </div>
    </div>
  );
}
