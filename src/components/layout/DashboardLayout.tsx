import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Activity, LogOut, ArrowLeft } from 'lucide-react';
import type { UserRole } from '@/types';

export const DashboardLayout: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Topbar Superior */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight text-foreground">
                ESU <span className="text-primary text-xs">Cruz del Eje</span>
              </span>
              <span className="text-[10px] text-muted-foreground leading-none">
                Panel Asistencial
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-input bg-background/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver al Portal Público</span>
          </Link>
        </div>

        {/* Controles de Sesión y Rol Rápido */}
        <div className="flex items-center gap-3">
          {/* Selector interactivo de Rol para pruebas académicas */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 text-xs">
            <span className="px-1.5 text-muted-foreground font-medium hidden md:inline">Cambiar Rol:</span>
            {(['PACIENTE', 'MEDICO', 'RECEPCIONISTA', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  switchRole(r);
                  if (r === 'PACIENTE') navigate('/dashboard/paciente');
                  else if (r === 'MEDICO') navigate('/dashboard/medico');
                  else if (r === 'RECEPCIONISTA') navigate('/dashboard/recepcion');
                  else if (r === 'ADMIN') navigate('/dashboard/admin');
                }}
                className={`rounded px-2 py-1 font-medium transition-all ${
                  user?.rol === r
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-background hover:text-foreground'
                }`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Botón Salir */}
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Contenedor Principal: Sidebar + Contenido de la Pantalla */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
