import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { DevRoleSwitcher } from '@/components/dev/DevRoleSwitcher';
import { useAuth } from '@/context/AuthContext';
import { Building2, ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { ValidacionDniModal } from '@/components/auth/ValidacionDniModal';
import { esPacienteDniVerificado, esRutaProtegidaDni } from '@/lib/identityValidation';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [modalDniAbierto, setModalDniAbierto] = useState(false);

  const esRutaSensible = esRutaProtegidaDni(location.pathname);
  const estaVerificado = esPacienteDniVerificado(user);
  const accesoBloqueado = user?.rol === 'PACIENTE' && esRutaSensible && !estaVerificado;

  useEffect(() => {
    if (accesoBloqueado) {
      setModalDniAbierto(true);
    }
  }, [accesoBloqueado, location.pathname]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Banner de verificación de email */}
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
            {accesoBloqueado ? (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-4 shadow-sm">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-800">
                  Validación de Identidad Obligatoria
                </h2>
                <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Para prevenir la usurpación de identidad y salvaguardar tus antecedentes médicos personales,
                  debes validar tu DNI, fecha de nacimiento y los últimos 4 números de trámite antes de acceder
                  a esta sección.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/paciente')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver al Portal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalDniAbierto(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Validar Identidad para Desbloquear</span>
                  </button>
                </div>
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>

      {/* Pop-up modal de validación de DNI */}
      <ValidacionDniModal
        isOpen={modalDniAbierto}
        onClose={() => setModalDniAbierto(false)}
        onSuccess={() => setModalDniAbierto(false)}
        isMandatory={accesoBloqueado}
      />
    </div>
  );
};
