'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

// Página de gestión de perfil y soporte
export default function ProfilePage() {
  const { user, loading, logout, updateProfile } = useAuth();
  const router = useRouter();
  
  // Estados para Modal de Soporte
  const [supportModal, setSupportModal] = useState(false);
  const [supportStatus, setSupportStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Estados para Modal de Edición de Perfil
  const [editModal, setEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-slate-400 font-bold uppercase tracking-widest">
          Cargando perfil...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-32 px-4 text-center space-y-10 animate-fade-in">
        <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto text-4xl">
          🔒
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Acceso Restringido</h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">
            Por favor, inicie sesión para visualizar y gestionar su información de perfil.
          </p>
        </div>
        <button 
          onClick={() => router.push('/login')}
          className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/30 hover:-translate-y-1 transition-all active:scale-95"
        >
          Ir al Inicio de Sesión
        </button>
      </div>
    );
  }

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportStatus('sending');
    setTimeout(() => {
      setSupportStatus('sent');
      setTimeout(() => {
        setSupportModal(false);
        setSupportStatus('idle');
      }, 2000);
    }, 1500);
  };

  const openEditModal = () => {
    setEditName(user.name);
    setEditRole(user.role || 'Administrador de Proyecto');
    setEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await updateProfile(editName, editRole);
      setEditModal(false);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 animate-fade-in">
      
      {/* Cabecera */}
      <div className="relative mb-20">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[80px] rounded-full" />
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-500/30">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              {user.name}
            </h1>
            <p className="text-xl text-slate-400 dark:text-slate-500 font-medium">
              {user.email}
            </p>
          </div>
          <button 
            onClick={openEditModal}
            className="px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
          >
            Editar Perfil
          </button>
        </div>
      </div>

      {/* Información detallada */}
      <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-12 border border-slate-50 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">Rol de Usuario</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {user.role || 'Administrador de Proyecto'}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">Miembro desde</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {new Date(user.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">Estado de la Cuenta</div>
            <div className="inline-flex items-center gap-2 text-emerald-500 font-bold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Verificada y Activa
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">ID de Identidad</div>
            <div className="text-sm font-mono text-slate-400">TF-{user.id.toString().padStart(6, '0')}</div>
          </div>

        </div>
      </div>

      {/* Acciones de Cuenta */}
      <div className="flex flex-wrap gap-6 justify-center md:justify-start">
        <button
          onClick={logout}
          className="px-10 py-5 bg-red-500/10 text-red-500 font-black rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          Cerrar Sesión Segura
        </button>
        <div className="p-5 text-slate-400 text-sm font-medium">
          ¿Necesitás ayuda con tu cuenta? <span onClick={() => setSupportModal(true)} className="text-indigo-600 font-bold cursor-pointer hover:underline">Contactar soporte</span>
        </div>
      </div>

      {/* Modal de edición */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Editar Perfil" maxWidth="md">
        <form onSubmit={handleEditSubmit} className="p-10 space-y-8 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
            <input 
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo / Rol</label>
            <input 
              required
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              placeholder="Ej: Gerente de Producto"
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>
          <Button type="submit" loading={editLoading} className="w-full py-5 rounded-2xl font-black text-lg">
            Guardar Cambios
          </Button>
        </form>
      </Modal>

      {/* Modal de Soporte */}
      <Modal isOpen={supportModal} onClose={() => setSupportModal(false)} title="Contactar Soporte Técnico" maxWidth="md">
        <form onSubmit={handleSupportSubmit} className="p-10 space-y-8 text-left">
          {supportStatus === 'sent' ? (
            <div className="py-20 text-center space-y-6 animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-4xl">✓</div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Mensaje Enviado</h3>
              <p className="text-slate-500">Nuestro equipo revisará tu solicitud a la brevedad.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asunto</label>
                <input 
                  required
                  placeholder="Ej: Problema con la Papelera"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mensaje</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Describe el inconveniente o consulta..."
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none resize-none"
                />
              </div>
              <Button type="submit" loading={supportStatus === 'sending'} className="w-full py-5 rounded-2xl font-black text-lg">
                Enviar Mensaje
              </Button>
            </>
          )}
        </form>
      </Modal>

    </div>
  );
}
