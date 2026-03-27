'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      setError('Por favor, ingresa tus credenciales completas.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      router.push('/projects');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      setError(message || 'No se pudo iniciar sesión. Revisa tus datos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#04080f] px-4 transition-colors duration-500">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl p-10 shadow-2xl shadow-slate-200 dark:shadow-none transition-all">
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 mb-4 transition-transform hover:scale-105">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white text-3xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">
            TaskFlow
          </span>
          <p className="text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest mt-1">Gestión de Proyectos</p>
        </div>

        <div className="mb-8">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Bienvenido de nuevo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Accede para continuar con tus proyectos.</p>
        </div>

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-indigo-50/30 dark:bg-slate-900/40 border border-indigo-100/50 dark:border-white/5 shadow-sm mb-8">
          <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 animate-pulse" />
          <p className="text-[11px] leading-relaxed font-bold text-slate-700 dark:text-slate-400">
            Acceso Demo: <span className="text-indigo-600 dark:text-indigo-300 underline underline-offset-2">demo@taskflow.com</span> / <span className="text-indigo-600 dark:text-indigo-300">123456</span>
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="login-email"
            label="Correo electrónico"
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 transition-all"
            required
            autoFocus
          />
          <Input
            id="login-password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 transition-all"
            required
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 
                       hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-sm text-slate-400 dark:text-slate-600 text-center mt-8 font-medium">
          ¿No tienes una cuenta activa?{' '}
          <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold underline underline-offset-4">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
