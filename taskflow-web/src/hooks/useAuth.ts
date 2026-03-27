import { useContext } from 'react';
import { AuthContext, AuthContextValue } from '@/context/AuthContext';

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return ctx;
}
