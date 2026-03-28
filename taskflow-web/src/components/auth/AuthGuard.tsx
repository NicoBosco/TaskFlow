'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

// AuthGuard protege rutas del lado del cliente
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Redirige al login recordando la ruta de origen
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  // Mientras carga o sin autenticación, no renderizamos el contenido protegido
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500 animate-pulse">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
