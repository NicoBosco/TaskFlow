import { useContext } from 'react';
import { ThemeContext, ThemeContextType } from '@/context/ThemeContext';

/**
 * Hook personalizado para acceder al estado y control del tema.
 * Centraliza el consumo del ThemeContext.
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}
