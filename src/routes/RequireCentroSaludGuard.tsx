import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Building2, AlertTriangle, LogOut, ArrowLeft } from 'lucide-react';

export const RequireCentroSaludGuard: React.FC = () => {
  const { user, logout } = useAuth();
  const isDev = Boolean(import.meta.env.DEV && (user?.isDeveloper || user?.email === 'dev@esu.gob.ar'));

  // Bloquear recepcionistas sin centro de salud asignado (fail-closed)
  if (user && user.rol === 'RECEPCIONISTA' && !user.centroSaludId && !isDev) {
    return (
      <div className="flex items-center justify-center py-8 px-4 sm:px-6">
        <section
          role="alert"
          aria-labelledby="guard-title"
          aria-describedby="guard-desc"
          className="max-w-lg w-full rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs text-center space-y-6"
        >
          <div
            className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/20"
            aria-hidden="true"
          >
            <AlertTriangle className="w-7 h-7" aria-hidden="true" />
          </div>

          <header className="space-y-2">
            <h1 id="guard-title" className="text-xl font-bold tracking-tight text-foreground">
              Cuenta de Recepción Sin Sede Asignada
            </h1>
            <p id="guard-desc" className="text-sm text-muted-foreground leading-relaxed">
              Para resguardar los datos clínicos de los pacientes y organizar las salas de espera, cada cuenta de recepción debe pertenecer al centro de salud donde prestás servicio.
            </p>
          </header>

          <div className="rounded-xl border border-border/80 bg-muted/40 p-4 text-left text-xs text-foreground space-y-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Building2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span>Pasos para habilitar tu acceso:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground pl-1">
              <li>Contactá al administrador del centro o de la red de salud de Cruz del Eje.</li>
              <li>Solicitá que asocien tu usuario a la sede correspondiente.</li>
              <li>Volvé a iniciar sesión para ingresar a tu mostrador de atención.</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => logout()}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-input bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Cerrar Sesión</span>
            </button>
            <Link
              to="/portal"
              className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Ir al Portal</span>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return <Outlet />;
};
