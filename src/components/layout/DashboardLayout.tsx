import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { DevRoleSwitcher } from '@/components/dev/DevRoleSwitcher';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* HU-43: Banner de verificación de email */}
      <EmailVerificationBanner />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header Superior del Dashboard con Switcher Dev e Indicadores */}
          <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/60 px-4 sm:px-6 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <DevRoleSwitcher />
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
