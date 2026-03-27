'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';
import { isAxiosError } from 'axios';
import { User } from '@/types';
import { getToken, saveToken, removeToken } from '@/lib/auth';
import { authApi } from '@/lib/api';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (name?: string, role?: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      if (!getToken()) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const userData = await authApi.getMe();
        if (isMounted) setUser(userData);
      } catch (err: unknown) {
        // En caso de error (token expirado o inválido), reseteamos el estado y limpiamos el token de forma silenciosa
        if (isMounted) {
          setUser(null);
          if (isAxiosError(err) && err.response?.status === 401) {
            removeToken();
            // No hacemos log ni re-lanzamos para evitar el overlay de error en desarrollo
          } else {
            // Solo logueamos errores que no sean 401 (ej: problemas de red reales)
            console.error('Error al restaurar sesión:', err);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    restoreSession();
    return () => { isMounted = false; };
  }, []);

  async function login(email: string, password: string): Promise<void> {
    try {
      const data = await authApi.login({ email, password });
      saveToken(data.token);
      setUser(data.user);
    } catch (err: unknown) {
      let message = 'Error al iniciar sesión';
      
      if (isAxiosError(err)) {
        const serverData = err.response?.data;
        message = (serverData && typeof serverData === 'object' ? (serverData.error || serverData.message) : null) ||
                  (typeof serverData === 'string' && !serverData.includes('<!DOCTYPE') ? serverData : null) ||
                  err.message;
        
        // Traducción manual de códigos comunes si no hay mensaje específico
        if (err.response?.status === 409) message = 'Este correo electrónico ya está registrado.';
        if (err.response?.status === 401) message = 'Credenciales inválidas o sesión expirada.';
        if (err.response?.status === 400) message = 'Los datos enviados son inválidos. Revisa el formulario.';
      } else if (err instanceof Error) {
        message = err.message;
      }

      throw new Error(message);
    }
  }

  async function register(name: string, email: string, password: string): Promise<void> {
    try {
      const data = await authApi.register({ name, email, password });
      saveToken(data.token);
      setUser(data.user);
    } catch (err: unknown) {
      let message = 'Error al registrarse';

      if (isAxiosError(err)) {
        const serverData = err.response?.data;
        message = (serverData && typeof serverData === 'object' ? (serverData.error || serverData.message) : null) ||
                  (typeof serverData === 'string' && !serverData.includes('<!DOCTYPE') ? serverData : null) ||
                  err.message;
        
        if (err.response?.status === 409) message = 'Este correo electrónico ya está registrado.';
        if (err.response?.status === 400) message = 'Por favor, completa todos los campos correctamente.';
      } else if (err instanceof Error) {
        message = err.message;
      }

      throw new Error(message);
    }
  }

  async function updateProfile(name?: string, role?: string): Promise<void> {
    const updatedUser = await authApi.updateProfile({ name, role });
    setUser(updatedUser);
  }

  function logout(): void {
    removeToken();
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

