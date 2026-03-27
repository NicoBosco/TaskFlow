'use client';

//Footer
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 dark:border-white/5 bg-white/50 dark:bg-[#04080f]/50 backdrop-blur-xl mt-auto transition-colors duration-500">
      <div className="mx-auto max-w-[1800px] px-4 py-10 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          {/* Identidad de Marca */}
          <div className="flex flex-col gap-2 items-center sm:items-start text-center sm:text-left">
            <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">
              © {year} <span className="text-indigo-600">TaskFlow</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-tight">
              Plataforma de Gestión de Proyectos.
            </p>
          </div>
          
          {/* Créditos de Portafolio */}
          <div className="flex flex-col gap-2 items-center sm:items-end text-center sm:text-right">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold italic">
              Portfolio Project de Bosco Mateo Nicolás
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
