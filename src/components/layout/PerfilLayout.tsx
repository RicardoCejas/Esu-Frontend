import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROLE_HOME } from '@/lib/roles';
import { ArrowLeft } from 'lucide-react';

export const PerfilLayout: React.FC = () => {
  const { user } = useAuth();
  const backTo = user ? ROLE_HOME[user.rol] : '/';

  return (
    <div className="flex min-h-screen flex-col bg-muted/20 text-foreground transition-colors duration-200">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <img src="/logo-icon.png" alt="ESU" className="h-8 w-8 object-contain" />
            <span className="font-heading text-sm font-bold text-foreground">
              ESU <span className="text-xs text-primary">Cruz del Eje</span>
            </span>
          </Link>
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver al panel</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
};
