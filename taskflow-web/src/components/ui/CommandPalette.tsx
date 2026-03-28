'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { projectsApi } from '@/lib/api';
import { Project } from '@/types';

/**
 * Buscador global y paleta de comandos (Ctrl + K).
 */
export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();

  // Atajo de teclado global
  useEffect(() => {
    // Carga inicial de proyectos (solo si hay usuario autenticado)
    if (user) {
      projectsApi.getAll().then(setAllProjects).catch(() => {
        // Silenciamos el error para evitar ruido en consola si la sesión expira
        setAllProjects([]);
      });
    }

    const resetAndOpen = () => {
      setQuery('');
      setSelectedIndex(0);
      setIsOpen(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
      
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (!isOpen) {
          resetAndOpen();
        } else {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('open-command-palette', resetAndOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('open-command-palette', resetAndOpen);
    };
  }, [isOpen, user]); // Dependencia necesaria para el toggle manual y sincronización de auth

  // Autofocus al abrir (Efecto puramente de UI/DOM)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Derivación de resultados (Pure logic via useMemo)
  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    
    return allProjects.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [query, allProjects]);

  const handleAction = (path: string) => {
    if (path !== '#') {
      router.push(path);
    }
    setIsOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % (results.length + 3)); // +3 por las acciones estáticas
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + (results.length + 3)) % (results.length + 3));
    } else if (e.key === 'Enter') {
      if (selectedIndex < results.length) {
        handleAction(`/projects/${results[selectedIndex].id}`);
      } else {
        const actionIdx = selectedIndex - results.length;
        if (actionIdx === 0) handleAction('/projects');
        if (actionIdx === 1) { /* Lógica de cambio de tema si fuera necesaria */ setIsOpen(false); }
        if (actionIdx === 2) handleAction('/projects?view=deleted');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-white/5 overflow-hidden animate-slide-up"
        onKeyDown={onKeyDown}
      >
        {/* Input de Búsqueda */}
        <div className="p-8 border-b border-slate-50 dark:border-white/5 flex items-center gap-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-400">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar proyecto o acción..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-2xl font-bold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 outline-none"
          />
          <div className="px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Esc
          </div>
        </div>

        {/* Resultados y Acciones */}
        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* Proyectos Encontrados */}
          {results.length > 0 && (
            <div className="mb-6">
              <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                Proyectos coincidentes
              </div>
              {results.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => handleAction(`/projects/${p.id}`)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                    selectedIndex === i ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${selectedIndex === i ? 'bg-white' : 'bg-indigo-500'}`} />
                  <span className="font-bold flex-1 text-left">{p.name}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${selectedIndex === i ? 'text-indigo-200' : 'text-slate-400'}`}>
                    Abrir →
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Acciones del Sistema */}
          <div>
            <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
              Acciones Rápidas
            </div>
            {[
              { label: 'Ir a Todos los Proyectos', icon: '📁', path: '/projects' },
              { label: 'Ver Papelera de Reciclaje', icon: '🗑️', path: '/projects?view=deleted' },
              { label: 'Configuración / Perfil', icon: '👤', path: '/profile' }
            ].map((action, i) => {
              const globalIdx = i + results.length;
              return (
                <button
                  key={action.label}
                  onClick={() => handleAction(action.path)}
                  onMouseEnter={() => setSelectedIndex(globalIdx)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                    selectedIndex === globalIdx ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="font-bold flex-1 text-left">{action.label}</span>
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    selectedIndex === globalIdx ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                  }`}>
                    ⌘ Enter
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Informativo */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="flex gap-4">
            <span>↑↓ Navegar</span>
            <span>↵ Seleccionar</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Plataforma</span>
            <span className="text-indigo-600">TaskFlow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
