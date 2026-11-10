import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { DevRoleSwitcher } from '@/components/dev/DevRoleSwitcher';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
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

  const tieneTelefonoValido = Boolean(
    user?.telefono &&
    user.telefono.trim().length >= 6 &&
    user.telefono !== 'Sin especificar' &&
    user.telefono !== '3549000000'
  );

  // Detectar si el usuario requiere completar sus datos de paciente (ej. al ingresar con Google)
  const necesitaCompletarDatos =
    user?.rol === 'PACIENTE' &&
    (!user.dni ||
      user.dni.startsWith('DNI-') ||
      user.dni.startsWith('PENDIENTE') ||
      user.dni.startsWith('G-') ||
      !tieneTelefonoValido ||
      !user.nombre ||
      user.nombre === 'Paciente Registrado' ||
      !estaVerificado);

  useEffect(() => {
    if (accesoBloqueado || necesitaCompletarDatos) {
      setModalDniAbierto(true);
    } else {
      setModalDniAbierto(false);
    }
  }, [accesoBloqueado, necesitaCompletarDatos, location.pathname]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Banner de verificación de email */}
      <EmailVerificationBanner />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header Superior del Dashboard con Switcher Dev e Indicadores */}
          <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 sm:px-6 border-b border-border/60">
            <div className="flex items-center gap-3 min-w-0">
              <DevRoleSwitcher />
            </div>

            <div className="flex items-center gap-3">
              <NotificationCenter />
            </div>
          </header>

          <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
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
