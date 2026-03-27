'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, useTheme } from '@/hooks';

/** Barra de navegación con controles de acceso y búsqueda */
export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

    // Prevenir errores de hidratación
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function handleLogout() {
    logout();
  }

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-slate-100/50 dark:border-white/5 shadow-[0_1px_40px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between transition-all duration-500">
        
        <Link
          href="/projects"
          className="group flex items-center gap-3 font-bold text-slate-900 dark:text-white transition-all duration-300"
        >
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-indigo-200 dark:shadow-indigo-900/20 shadow-xl group-hover:bg-indigo-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <span className="text-xl tracking-tighter font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-slate-200 dark:to-indigo-400">
            TaskFlow
          </span>
        </Link>

        <nav className="flex items-center gap-6" aria-label="Navegación principal">
          <Link
            href="/projects"
            className="text-xs font-black text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 uppercase tracking-widest hidden md:block"
          >
            Mis Proyectos
          </Link>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-400 dark:text-slate-500 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all group"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Buscar...</span>
            <div className="flex gap-1">
              <span className="px-1.5 py-0.5 rounded bg-white dark:bg-white/10 border border-slate-100 dark:border-white/10 text-[9px] font-bold">Ctrl</span>
              <span className="px-1.5 py-0.5 rounded bg-white dark:bg-white/10 border border-slate-100 dark:border-white/10 text-[9px] font-bold">K</span>
            </div>
          </button>

          <div className="flex items-center gap-4 pl-6 border-l border-slate-100 dark:border-slate-800">
            
            {mounted ? (
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all active:scale-90 shadow-inner"
                aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {theme === 'dark' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>
            ) : (
              <div className="p-2.5 w-[42px] h-[42px] rounded-xl bg-slate-50 dark:bg-slate-800 animate-pulse" />
            )}

            {!loading && (
              user ? (
                <div className="flex items-center gap-4 group">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">Sesión</span>
                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200 leading-tight">
                      {user.name.split(' ')[0]}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-all border border-slate-100 dark:border-slate-800 active:scale-95"
                    aria-label="Cerrar sesión"
                  >
                    <span>Cerrar Sesión</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2.5 rounded-xl text-sm font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 transition-all"
                >
                  Acceder
                </Link>
              )
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
