import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/ui/Navbar';
import CommandPalette from '@/components/ui/CommandPalette';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'TaskFlow — Gestión de proyectos',
  description: 'Gestión de proyectos y tareas con enfoque en la seguridad.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased selection:bg-indigo-100 selection:text-indigo-900 bg-white dark:bg-[#04080f] text-slate-900 dark:text-slate-100 min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              
              <CommandPalette />

              <main className="flex-grow max-w-[1800px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 transition-all duration-500">
                {children}
              </main>

              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
