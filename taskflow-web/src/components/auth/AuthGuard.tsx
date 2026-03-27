'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * AuthGuard protects client-side routes.
 * It redirects to /login if the user is not authenticated.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login, and optionally remember where we wanted to go
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  // While loading or not authenticated, don't show the protected content
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
