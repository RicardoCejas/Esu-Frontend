import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { DevRoleSwitcher } from '@/components/dev/DevRoleSwitcher';
import { useAuth } from '@/context/AuthContext';
import { Building2 } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* HU-43: Banner de verificación de email */}
      <EmailVerificationBanner />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header Superior del Dashboard con Switcher Dev e Indicadores */}
          <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/60 px-4 sm:px-6 backdrop-blur-xs">
            <div className="flex items-center gap-3 min-w-0">
              <DevRoleSwitcher />
              
              {user?.centroSaludNombre && (
                <div className="hidden md:flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300">
                  <Building2 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="font-semibold truncate max-w-[280px]">
                    {user.rol === 'PACIENTE'
                      ? `Ref: ${user.centroSaludNombre}`
                      : user.rol === 'MEDICO'
                      ? `Médico en ${user.centroSaludNombre}`
                      : user.centroSaludNombre}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <NotificationCenter />
            </div>
          </header>

          <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
