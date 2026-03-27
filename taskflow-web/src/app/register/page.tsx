'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import Input from '@/components/ui/Input';

/**
 * Página de registro para nuevos usuarios.
 * Mantiene la coherencia visual con la página de acceso mediante una tarjeta estilizada.
 */
export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validación y envío de datos de registro
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    // Validaciones básicas de integridad de datos
    if (!name.trim() || name.trim().length < 2) {
      setError('El nombre debe ser real y tener al menos 2 caracteres.');
      return;
    }
    if (!email.includes('@')) {
      setError('Asegúrate de ingresar un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setError('Por seguridad, la contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden. Inténtalo de nuevo.');
      return;
    }

    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      router.push('/projects');
    } catch (err: unknown) {
      // El mensaje ya viene procesado desde el AuthContext (es una Error instance)
      const message = err instanceof Error ? err.message : 'Error inesperado';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#04080f] px-4 transition-colors duration-500">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl p-10 shadow-2xl shadow-slate-200 dark:shadow-none transition-all">
        
        {/* Identidad visual de la aplicación */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 mb-4 transition-transform hover:scale-105">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white text-3xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">
            TaskFlow
          </span>
          <p className="text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest mt-1">Únete a la plataforma</p>
        </div>

        <div className="mb-8">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Crea tu cuenta</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Empieza a organizar tus proyectos hoy mismo.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Formulario de registro con inputs estilizados */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="reg-name"
            label="Nombre completo"
            placeholder="Ej: Juan Pérez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 transition-all"
            required
            autoFocus
          />
          <Input
            id="reg-email"
            label="Correo electrónico"
            type="email"
            placeholder="juan@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 transition-all"
            required
          />
          <Input
            id="reg-password"
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 transition-all"
            required
          />
          <Input
            id="reg-confirm"
            label="Confirmar contraseña"
            type="password"
            placeholder="Repite tu clave"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="rounded-xl border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 transition-all"
            required
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 
                       hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p className="text-sm text-slate-400 dark:text-slate-600 text-center mt-8 font-medium">
          ¿Ya eres usuario?{' '}
          <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold underline underline-offset-4">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
