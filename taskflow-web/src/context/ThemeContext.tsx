'use client';

import React, { createContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Proveedor de tema global.
 * Gestiona la persistencia en localStorage y aplica la clase 'dark' al elemento raíz.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Sincronización inicial post-hidratación
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('taskflow-theme') as Theme | null;
      if (saved) {
        setTheme(saved);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Única fuente de verdad para aplicar el tema al DOM y persistir cambios
  useEffect(() => {
    if (!mounted) return;

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('taskflow-theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

